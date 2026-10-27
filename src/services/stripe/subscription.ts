import Stripe from "stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { Result, success, ErrorFactory } from "@/lib/errors";
import { PLANS } from "@/lib/plans";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

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
    case "invoice.payment_succeeded": {
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

async function setPlanFree(customerId: string): Promise<boolean> {
  const updated = await db.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan: "free" },
  });
  return updated.count > 0;
}

export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  planId: "pro";
  successUrl?: string;
  cancelUrl?: string;
}): Promise<Result<{ url: string; sessionId: string }>> {
  const stripe = getStripe();

  if (!stripe || !isStripeConfigured()) {
    return ErrorFactory.validation("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }

  const userId = await resolveUserId(params.userId, params.userEmail);
  if (!userId) {
    return ErrorFactory.unauthorized("Signed-in user was not found.");
  }

  const plan = PLANS.pro;
  const appUrl = env.AUTH_URL;
  const successUrl = params.successUrl || `${appUrl}/dashboard/billing?success=true&plan=${plan.id}`;
  const cancelUrl = params.cancelUrl || `${appUrl}/dashboard/billing?canceled=true`;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true },
    });

    const appMeta = appMetadata();
    let customerId = user?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: params.userEmail || user?.email || undefined,
        metadata: { userId, ...appMeta },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AI-Starter ${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: plan.priceMonthly * 100,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId: plan.id,
        ...appMeta,
      },
      subscription_data: {
        metadata: {
          userId,
          planId: plan.id,
          ...appMeta,
        },
      },
    });

    if (!session.url) {
      return ErrorFactory.stripe("Stripe did not return a Checkout URL.");
    }

    return success({ url: session.url, sessionId: session.id });
  } catch (error: unknown) {
    logger.error({ error, userId }, "Failed to create Stripe Checkout session");
    return ErrorFactory.stripe("Failed to create Stripe Checkout session", error);
  }
}

async function findCancelableSubscription(
  stripe: Stripe,
  customerId: string
): Promise<Stripe.Subscription | undefined> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });
  return subscriptions.data.find((item) =>
    item.status === "active" || item.status === "trialing" || item.status === "past_due"
  );
}

let portalConfigurationId: string | undefined;

async function ensurePortalConfiguration(stripe: Stripe): Promise<string | undefined> {
  if (portalConfigurationId) return portalConfigurationId;

  const existing = await stripe.billingPortal.configurations.list({ limit: 10, active: true });
  const withImmediateCancel = existing.data.find(
    (config) =>
      config.features.subscription_cancel?.enabled &&
      config.features.subscription_cancel.mode === "immediately"
  );
  if (withImmediateCancel) {
    portalConfigurationId = withImmediateCancel.id;
    return portalConfigurationId;
  }

  const created = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your AI-Starter subscription",
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
        mode: "immediately",
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
      const subscription = await findCancelableSubscription(stripe, user.stripeCustomerId);
      if (!subscription) {
        return ErrorFactory.validation("No active subscription to cancel.");
      }
      sessionParams.flow_data = {
        type: "subscription_cancel",
        subscription_cancel: { subscription: subscription.id },
        after_completion: {
          type: "redirect",
          redirect: { return_url: returnUrl },
        },
      };
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
  try {
    logger.info({ type: event.type, id: event.id }, "Processing Stripe webhook");

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

        if (!userId) {
          return ignoreWebhook(event.type, "Missing userId metadata.");
        }

        const user = await db.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!user) {
          return ignoreWebhook(event.type, "User not in this database.");
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            plan: "pro",
            ...(customerId ? { stripeCustomerId: customerId } : {}),
            credits: { increment: PLANS.pro.credits },
          },
        });
        logger.info({ userId, customerId }, "Pro subscription activated");
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = stripeCustomerRef(invoice.customer);
        if (customerId && invoice.billing_reason === "subscription_cycle") {
          const user = await db.user.findUnique({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });
          if (!user) {
            return ignoreWebhook(event.type, "User not in this database.");
          }
          await db.user.update({
            where: { id: user.id },
            data: { credits: { increment: PLANS.pro.credits } },
          });
          logger.info({ userId: user.id }, "Monthly Pro credits replenished");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.status !== "canceled" && !subscription.cancel_at_period_end) {
          break;
        }
        const customerId = stripeCustomerRef(subscription.customer);
        if (!customerId) break;
        if (!(await setPlanFree(customerId))) {
          return ignoreWebhook(event.type, "User not in this database.");
        }
        logger.info({ customerId, status: subscription.status }, "Subscription canceled; plan set to free");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = stripeCustomerRef(subscription.customer);
        if (!customerId) break;
        if (!(await setPlanFree(customerId))) {
          return ignoreWebhook(event.type, "User not in this database.");
        }
        logger.info({ customerId }, "Subscription canceled; plan set to free");
        break;
      }

      default:
        break;
    }

    return success({ processed: true, type: event.type });
  } catch (error: unknown) {
    logger.error({ error, eventType: event.type }, "Stripe webhook handling failed");
    return ErrorFactory.stripe("Failed to process webhook event", error);
  }
}
