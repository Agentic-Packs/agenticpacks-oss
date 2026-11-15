import Stripe from "stripe";
import { Prisma } from "@/generated/prisma";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { Result, success, ErrorFactory } from "@/lib/errors";
import { PLANS } from "@/lib/plans";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function resolveUserId(userIdParam: string, userEmail?: string): Promise<string | null> {
  if (userIdParam && userIdParam !== "demo-user") {
    const user = await db.user.findUnique({ where: { id: userIdParam }, select: { id: true } });
    if (user) return user.id;
  }

  if (userEmail) {
    const userByEmail = await db.user.findUnique({
      where: { email: userEmail.toLowerCase() },
      select: { id: true },
    });
    if (userByEmail) return userByEmail.id;
  }

  return null;
}

function stripeCustomerRef(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if ("deleted" in customer && customer.deleted) return null;
  return customer.id;
}

const FOREIGN_APP_REASON = "Meant for another domain.";

type WebhookHandleResult = {
  processed: boolean;
  type: string;
  ignored?: boolean;
  duplicate?: boolean;
  reason?: string;
};

function stripeAppId(): string {
  return env.STRIPE_APP_ID.trim();
}

function appMetadata(): Record<string, string> {
  const appId = stripeAppId();
  return appId ? { appId } : {};
}

function metaAppId(metadata: Stripe.Metadata | null | undefined): string | undefined {
  const value = metadata?.appId?.trim();
  return value || undefined;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const withSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    parent?: {
      subscription_details?: { subscription?: string | Stripe.Subscription | null };
    };
  };

  const classic = withSubscription.subscription;
  if (typeof classic === "string") return classic;
  if (classic && typeof classic === "object" && "id" in classic) return classic.id;

  const nested = withSubscription.parent?.subscription_details?.subscription;
  if (typeof nested === "string") return nested;
  if (nested && typeof nested === "object" && "id" in nested) return nested.id;
  return null;
}

async function resolveEventAppId(event: Stripe.Event): Promise<string | undefined> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return metaAppId(session.metadata);
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      return metaAppId(subscription.metadata);
    }
    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const fromInvoice = metaAppId(invoice.metadata);
      if (fromInvoice) return fromInvoice;

      const stripe = getStripe();
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (!stripe || !subscriptionId) return undefined;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return metaAppId(subscription.metadata);
    }
    default:
      return undefined;
  }
}

function ignoreWebhook(type: string, reason: string): Result<WebhookHandleResult> {
  logger.info({ type, reason }, "Stripe webhook ignored");
  return success({ processed: false, type, ignored: true, reason });
}

const LIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

export type PlanChangeAction =
  | { action: "checkout" }
  | { action: "resume" }
  | { action: "cancel" }
  | { action: "refuse"; reason: string };

export type CheckoutResult = {
  url: string;
  sessionId: string;
  mode: "checkout" | "scheduled" | "resumed";
};

export function evaluatePlanRequest(input: {
  requestedPlanId: string;
  currentPlanId: string;
  activeSubscriptionCount: number;
}): PlanChangeAction {
  if (input.activeSubscriptionCount > 1) {
    return {
      action: "refuse",
      reason: "More than one active subscription. Cancel the extra subscription in the Stripe dashboard.",
    };
  }
  if (input.requestedPlanId !== "pro" && input.requestedPlanId !== "free") {
    return { action: "refuse", reason: "Unknown plan." };
  }
  if (input.activeSubscriptionCount === 0) {
    if (input.requestedPlanId === "free") {
      return { action: "refuse", reason: "There is no subscription to cancel." };
    }
    return { action: "checkout" };
  }
  if (input.requestedPlanId === input.currentPlanId) {
    return { action: "resume" };
  }
  if (input.requestedPlanId === "free") {
    return { action: "cancel" };
  }
  return { action: "refuse", reason: "Pro is already the paid plan." };
}

export function shouldRestartBillingPeriod(previousStatus: string, billingReason: string | null): boolean {
  return previousStatus === "PAST_DUE" && billingReason === "subscription_cycle";
}

function subscriptionRef(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function ensureProPrice(stripe: Stripe): Promise<string> {
  const lookupKey = "agenticpacks_pro_monthly";
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const found = existing.data[0];
  if (found) return found.id;
  const created = await stripe.prices.create({
    currency: "usd",
    unit_amount: PLANS.pro.priceMonthly * 100,
    recurring: { interval: "month" },
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    product_data: { name: `AgenticPacks ${PLANS.pro.name} Plan` },
  });
  return created.id;
}

async function listLiveSubscriptions(stripe: Stripe, customerId: string): Promise<Stripe.Subscription[]> {
  const listed = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
  return listed.data.filter((item) => LIVE_SUBSCRIPTION_STATUSES.has(item.status));
}

async function applyLocalPlanChange(input: {
  userId: string;
  decision: PlanChangeAction;
  appUrl: string;
}): Promise<Result<CheckoutResult>> {
  if (input.decision.action === "refuse") {
    return ErrorFactory.validation(input.decision.reason);
  }

  if (input.decision.action === "checkout") {
    await db.user.update({
      where: { id: input.userId },
      data: {
        plan: "pro",
        subscriptionStatus: "ACTIVE",
        stripeSubscriptionId: `mock_${input.userId}`,
        nextPlan: null,
        credits: { increment: PLANS.pro.credits },
      },
    });
    return success({
      url: `${input.appUrl}/dashboard/billing?mock_success=true&plan=pro`,
      sessionId: `mock_session_${Date.now()}`,
      mode: "checkout",
    });
  }

  await db.user.update({
    where: { id: input.userId },
    data: { nextPlan: input.decision.action === "cancel" ? "free" : null },
  });
  return success({
    url: `${input.appUrl}/dashboard/billing?scheduled=${input.decision.action === "cancel" ? "free" : "pro"}`,
    sessionId: `mock_schedule_${Date.now()}`,
    mode: input.decision.action === "resume" ? "resumed" : "scheduled",
  });
}

export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  planId: "pro" | "free";
  successUrl?: string;
  cancelUrl?: string;
}): Promise<Result<CheckoutResult>> {
  const userId = await resolveUserId(params.userId, params.userEmail);
  if (!userId) {
    return ErrorFactory.unauthorized("Signed-in user was not found.");
  }

  const appUrl = env.AUTH_URL;
  const successUrl = params.successUrl || `${appUrl}/dashboard/billing?success=true&plan=${params.planId}`;
  const cancelUrl = params.cancelUrl || `${appUrl}/dashboard/billing?canceled=true`;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true, plan: true, email: true },
    });
    if (!user) {
      return ErrorFactory.unauthorized("Signed-in user was not found.");
    }

    const stripe = getStripe();
    if (!stripe || !isStripeConfigured()) {
      const activeSubscriptionCount = user.plan === "pro" || user.stripeSubscriptionId ? 1 : 0;
      const decision = evaluatePlanRequest({
        requestedPlanId: params.planId,
        currentPlanId: user.plan,
        activeSubscriptionCount,
      });
      return applyLocalPlanChange({ userId, decision, appUrl });
    }

    const appMeta = appMetadata();
    let customerId = user.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: params.userEmail || user.email || undefined,
        metadata: { userId, ...appMeta },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const live = await listLiveSubscriptions(stripe, customerId);
    const decision = evaluatePlanRequest({
      requestedPlanId: params.planId,
      currentPlanId: user.plan,
      activeSubscriptionCount: live.length,
    });
    if (decision.action === "refuse") {
      return ErrorFactory.validation(decision.reason);
    }

    if (decision.action === "checkout") {
      const priceId = await ensureProPrice(stripe);
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId, planId: "pro", ...appMeta },
        subscription_data: { metadata: { userId, planId: "pro", ...appMeta } },
      });
      if (!session.url) {
        return ErrorFactory.stripe("Stripe did not return a Checkout URL.");
      }
      return success({ url: session.url, sessionId: session.id, mode: "checkout" });
    }

    const subscription = live[0];
    if (!subscription) {
      return ErrorFactory.validation("No active subscription to change.");
    }
    if (!user.stripeSubscriptionId) {
      await db.user.update({
        where: { id: userId },
        data: { stripeSubscriptionId: subscription.id },
      });
    }

    if (decision.action === "resume") {
      await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: false });
      await db.user.update({ where: { id: userId }, data: { nextPlan: null } });
      return success({
        url: `${appUrl}/dashboard/billing?scheduled=pro`,
        sessionId: subscription.id,
        mode: "resumed",
      });
    }

    await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
    await db.user.update({ where: { id: userId }, data: { nextPlan: "free" } });
    return success({
      url: `${appUrl}/dashboard/billing?scheduled=free`,
      sessionId: subscription.id,
      mode: "scheduled",
    });
  } catch (error: unknown) {
    logger.error({ error, userId }, "Failed to create Stripe Checkout session");
    return ErrorFactory.stripe("Failed to create Stripe Checkout session", error);
  }
}

let portalConfigurationId: string | undefined;

async function ensurePortalConfiguration(stripe: Stripe): Promise<string | undefined> {
  if (portalConfigurationId) return portalConfigurationId;

  const existing = await stripe.billingPortal.configurations.list({ limit: 10, active: true });
  const withPeriodEndCancel = existing.data.find(
    (config) =>
      config.features.subscription_cancel?.enabled &&
      config.features.subscription_cancel.mode === "at_period_end"
  );
  if (withPeriodEndCancel) {
    portalConfigurationId = withPeriodEndCancel.id;
    return portalConfigurationId;
  }

  const created = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your AgenticPacks subscription",
    },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "name"],
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
      },
    },
  });
  portalConfigurationId = created.id;
  logger.info({ configurationId: created.id }, "Created Stripe Customer Portal configuration");
  return portalConfigurationId;
}

export async function createCustomerPortalSession(params: {
  userId: string;
  userEmail?: string;
  returnUrl?: string;
  flow?: "portal" | "cancel";
}): Promise<Result<{ url: string }>> {
  const stripe = getStripe();
  if (!stripe || !isStripeConfigured()) {
    return ErrorFactory.validation(
      "Stripe is not configured. Set STRIPE_SECRET_KEY."
    );
  }

  const userId = await resolveUserId(params.userId, params.userEmail);
  if (!userId) {
    return ErrorFactory.unauthorized("Signed-in user was not found.");
  }

  const appUrl = env.AUTH_URL;
  const returnUrl = params.returnUrl || `${appUrl}/dashboard/billing`;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return ErrorFactory.validation("No Stripe customer exists yet. Upgrade to Pro first.");
    }

    const configuration = await ensurePortalConfiguration(stripe);
    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: user.stripeCustomerId,
      return_url: returnUrl,
      ...(configuration ? { configuration } : {}),
    };

    if (params.flow === "cancel") {
      const scheduled = await createCheckoutSession({
        userId,
        userEmail: params.userEmail ?? "",
        planId: "free",
      });
      if (!scheduled.success) return scheduled;
      return success({ url: scheduled.data.url });
    }

    const portalSession = await stripe.billingPortal.sessions.create(sessionParams);
    return success({ url: portalSession.url });
  } catch (error: unknown) {
    logger.error({ error, userId }, "Failed to create Stripe Customer Portal session");
    return ErrorFactory.stripe("Failed to open the billing portal", error);
  }
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event
): Promise<Result<WebhookHandleResult>> {
  let restartSubscriptionId: string | null = null;
  try {
    const result: Result<WebhookHandleResult> = await db.$transaction(
      async (tx) => {
        const existing = await tx.stripeEvent.findUnique({
          where: { id: event.id },
        });
        if (existing) {
          return success({
            processed: false,
            type: event.type,
            ignored: true,
            duplicate: true,
            reason: "Duplicate event.",
          });
        }

        logger.info({ type: event.type, id: event.id }, "Processing Stripe webhook");

        await tx.stripeEvent.create({
          data: {
            id: event.id,
            type: event.type,
          },
        });

        const expectedAppId = stripeAppId();
        if (expectedAppId) {
          const eventAppId = await resolveEventAppId(event);
          if (eventAppId && eventAppId !== expectedAppId) {
            return ignoreWebhook(event.type, FOREIGN_APP_REASON);
          }
        }

        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const customerId = stripeCustomerRef(session.customer);
            const subscriptionId = subscriptionRef(session.subscription);
            const planId = session.metadata?.planId;

            if (!userId) {
              return ignoreWebhook(event.type, "Missing userId metadata.");
            }
            if (planId !== "pro") {
              return ignoreWebhook(event.type, "Unknown plan.");
            }

            const user = await tx.user.findUnique({
              where: { id: userId },
              select: { id: true, stripeSubscriptionId: true },
            });
            if (!user) {
              return ignoreWebhook(event.type, "User not in this database.");
            }
            if (user.stripeSubscriptionId && user.stripeSubscriptionId !== subscriptionId) {
              return ignoreWebhook(event.type, "A subscription is already saved.");
            }
            if (user.stripeSubscriptionId && user.stripeSubscriptionId === subscriptionId) {
              break;
            }

            await tx.user.update({
              where: { id: user.id },
              data: {
                plan: "pro",
                subscriptionStatus: "ACTIVE",
                nextPlan: null,
                ...(customerId ? { stripeCustomerId: customerId } : {}),
                ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
                credits: { increment: PLANS.pro.credits },
              },
            });
            logger.info({ userId, customerId }, "Pro subscription activated");
            break;
          }

          case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = stripeCustomerRef(invoice.customer);
            const subscriptionId = invoiceSubscriptionId(invoice);
            if (!customerId) break;

            const user = await tx.user.findUnique({
              where: { stripeCustomerId: customerId },
              select: { id: true, plan: true, nextPlan: true, stripeSubscriptionId: true, subscriptionStatus: true },
            });
            if (!user) {
              return ignoreWebhook(event.type, "User not in this database.");
            }
            if (user.stripeSubscriptionId && subscriptionId && user.stripeSubscriptionId !== subscriptionId) {
              return ignoreWebhook(event.type, "Different subscription.");
            }
            if (!user.stripeSubscriptionId && invoice.billing_reason !== "subscription_create") {
              return ignoreWebhook(event.type, "Subscription is not saved yet.");
            }

            if (invoice.billing_reason === "subscription_create") {
              await tx.user.update({
                where: { id: user.id },
                data: { subscriptionStatus: "ACTIVE" },
              });
              break;
            }

            if (invoice.billing_reason === "subscription_cycle") {
              const namedPlan = invoice.metadata?.planId;
              if ((namedPlan && namedPlan !== "pro") || user.plan !== "pro") {
                return ignoreWebhook(event.type, "Unknown plan.");
              }
              const restart = shouldRestartBillingPeriod(user.subscriptionStatus, invoice.billing_reason);
              await tx.user.update({
                where: { id: user.id },
                data: {
                  plan: "pro",
                  subscriptionStatus: "ACTIVE",
                  credits: PLANS.pro.credits,
                  ...(user.nextPlan === "pro" ? { nextPlan: null } : {}),
                },
              });
              if (restart && subscriptionId) restartSubscriptionId = subscriptionId;
              break;
            }

            if (invoice.billing_reason === "subscription_update" && invoice.metadata?.planId === "pro") {
              await tx.user.update({
                where: { id: user.id },
                data: {
                  plan: "pro",
                  nextPlan: null,
                  subscriptionStatus: "ACTIVE",
                  credits: { increment: PLANS.pro.credits },
                },
              });
            }
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = stripeCustomerRef(subscription.customer);
            if (!customerId) break;
            const user = await tx.user.findUnique({
              where: { stripeCustomerId: customerId },
              select: { id: true, stripeSubscriptionId: true },
            });
            if (!user) {
              return ignoreWebhook(event.type, "User not in this database.");
            }
            if (!user.stripeSubscriptionId || user.stripeSubscriptionId !== subscription.id) {
              return ignoreWebhook(event.type, "Different subscription.");
            }
            if (subscription.cancel_at_period_end && (subscription.status === "active" || subscription.status === "trialing")) {
              await tx.user.update({
                where: { id: user.id },
                data: { nextPlan: "free", subscriptionStatus: "ACTIVE" },
              });
              logger.info({ customerId }, "Cancellation scheduled; Pro stays effective");
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = stripeCustomerRef(subscription.customer);
            if (!customerId) break;
            const user = await tx.user.findUnique({
              where: { stripeCustomerId: customerId },
              select: { id: true, stripeSubscriptionId: true },
            });
            if (!user) {
              return ignoreWebhook(event.type, "User not in this database.");
            }
            if (user.stripeSubscriptionId !== subscription.id) {
              return ignoreWebhook(event.type, "Different subscription.");
            }
            await tx.user.update({
              where: { id: user.id },
              data: {
                plan: "free",
                nextPlan: null,
                stripeSubscriptionId: null,
                subscriptionStatus: "CANCELED",
                credits: 0,
              },
            });
            logger.info({ customerId }, "Saved subscription deleted; plan set to free");
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = stripeCustomerRef(invoice.customer);
            const subscriptionId = invoiceSubscriptionId(invoice);
            if (!customerId || invoice.billing_reason !== "subscription_cycle") break;
            const user = await tx.user.findUnique({
              where: { stripeCustomerId: customerId },
              select: { id: true, plan: true, stripeSubscriptionId: true },
            });
            if (!user) {
              return ignoreWebhook(event.type, "User not in this database.");
            }
            if (user.stripeSubscriptionId && subscriptionId && user.stripeSubscriptionId !== subscriptionId) {
              return ignoreWebhook(event.type, "Different subscription.");
            }
            const namedPlan = invoice.metadata?.planId;
            if ((namedPlan && namedPlan !== "pro") || user.plan !== "pro") {
              return ignoreWebhook(event.type, "Unknown plan.");
            }
            await tx.user.update({
              where: { id: user.id },
              data: { subscriptionStatus: "PAST_DUE", credits: PLANS.pro.credits },
            });
            logger.warn({ customerId, invoiceId: invoice.id }, "Renewal payment failed; spending blocked");
            break;
          }

          default:
            break;
        }

        return success({ processed: true, type: event.type });
      },
      { timeout: 20000 }
    );

    if (result.success && !result.data.ignored && restartSubscriptionId) {
      const stripe = getStripe();
      if (stripe) {
        await stripe.subscriptions.update(restartSubscriptionId, {
          billing_cycle_anchor: "now",
          proration_behavior: "none",
        });
      }
    }

    return result;
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      logger.info({ id: event.id, type: event.type }, "Duplicate Stripe webhook ignored");
      return success({
        processed: false,
        type: event.type,
        ignored: true,
        duplicate: true,
        reason: "Duplicate event.",
      });
    }
    logger.error({ error, eventType: event.type }, "Stripe webhook handling failed");
    return ErrorFactory.stripe("Failed to process webhook event", error);
  }
}
