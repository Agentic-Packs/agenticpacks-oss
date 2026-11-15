import * as dotenv from "dotenv";
import assert from "node:assert/strict";
import { test } from "node:test";

dotenv.config();
process.env.STRIPE_SECRET_KEY = "";
process.env.STRIPE_APP_ID = "";

const PRO_CREDITS = 500;
const TRIAL_CREDITS = 100;

test("OSS Stripe billing cases", async () => {
  const { db } = await import("../src/lib/db");
  const billing = await import("../src/services/stripe/subscription");
  const { getUserCredits } = await import("../src/services/ai/tokens");

  const user = await db.user.create({
    data: {
      email: `stripe-test-${Date.now()}@example.com`,
      name: "Stripe Test",
    },
  });

  const customerId = `cus_${user.id}`;
  const subscriptionId = `sub_${user.id}`;
  let eventCount = 0;
  const ran: string[] = [];

  const expectState = async (expected: {
    plan: string;
    nextPlan: string | null;
    stripeSubscriptionId: string | null;
    credits: number;
    subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELED";
  }) => {
    const row = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        plan: true,
        nextPlan: true,
        stripeSubscriptionId: true,
        credits: true,
        subscriptionStatus: true,
      },
    });
    assert.deepEqual(row, expected);
  };

  const apply = async (type: string, object: Record<string, unknown>, id?: string) => {
    eventCount += 1;
    const event = {
      id: id ?? `evt_${user.id}_${eventCount}`,
      object: "event",
      api_version: "2024-06-20",
      created: 1,
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type,
      data: { object },
    };
    const result = await billing.handleStripeWebhookEvent(event as never);
    if (!result.success) {
      throw new Error(`${type} failed: ${result.error.message}`);
    }
    return result.data;
  };

  const mark = (name: string) => {
    ran.push(name);
  };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });

    mark("first checkout");
    await apply("checkout.session.completed", {
      customer: customerId,
      subscription: subscriptionId,
      metadata: { userId: user.id, planId: "pro" },
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: TRIAL_CREDITS + PRO_CREDITS,
      subscriptionStatus: "ACTIVE",
    });

    mark("first invoice adds nothing");
    await apply("invoice.payment_succeeded", {
      customer: customerId,
      subscription: subscriptionId,
      billing_reason: "subscription_create",
      metadata: { planId: "pro" },
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: TRIAL_CREDITS + PRO_CREDITS,
      subscriptionStatus: "ACTIVE",
    });

    mark("duplicate event");
    const duplicate = await apply(
      "checkout.session.completed",
      {
        customer: customerId,
        subscription: subscriptionId,
        metadata: { userId: user.id, planId: "pro" },
      },
      `evt_${user.id}_1`
    );
    assert.equal(duplicate.duplicate, true);
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: TRIAL_CREDITS + PRO_CREDITS,
      subscriptionStatus: "ACTIVE",
    });

    mark("other subscription");
    await apply("customer.subscription.updated", {
      id: `sub_other_${user.id}`,
      customer: customerId,
      status: "active",
      cancel_at_period_end: true,
      metadata: { planId: "pro" },
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: TRIAL_CREDITS + PRO_CREDITS,
      subscriptionStatus: "ACTIVE",
    });

    mark("unknown plan");
    await db.user.update({ where: { id: user.id }, data: { credits: 800 } });
    await apply("checkout.session.completed", {
      customer: customerId,
      subscription: `sub_new_${user.id}`,
      metadata: { userId: user.id },
    });
    await apply("invoice.payment_succeeded", {
      customer: customerId,
      subscription: subscriptionId,
      billing_reason: "subscription_cycle",
      metadata: { planId: "missing-plan" },
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: 800,
      subscriptionStatus: "ACTIVE",
    });

    mark("second checkout refused");
    const second = billing.evaluatePlanRequest({
      requestedPlanId: "pro",
      currentPlanId: "pro",
      activeSubscriptionCount: 1,
    });
    assert.equal(second.action, "resume");
    assert.notEqual(second.action, "checkout");
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: 800,
      subscriptionStatus: "ACTIVE",
    });

    mark("cancel at period end");
    await apply("customer.subscription.updated", {
      id: subscriptionId,
      customer: customerId,
      status: "active",
      cancel_at_period_end: true,
      metadata: { planId: "pro" },
    });
    await expectState({
      plan: "pro",
      nextPlan: "free",
      stripeSubscriptionId: subscriptionId,
      credits: 800,
      subscriptionStatus: "ACTIVE",
    });

    mark("deleted other subscription");
    await apply("customer.subscription.deleted", {
      id: `sub_other_${user.id}`,
      customer: customerId,
      status: "canceled",
    });
    await expectState({
      plan: "pro",
      nextPlan: "free",
      stripeSubscriptionId: subscriptionId,
      credits: 800,
      subscriptionStatus: "ACTIVE",
    });

    mark("keep pro while cancellation is pending");
    const kept = await billing.createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      planId: "pro",
    });
    assert.equal(kept.success, true);
    if (kept.success) assert.equal(kept.data.mode, "resumed");
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: 800,
      subscriptionStatus: "ACTIVE",
    });

    mark("paid renewal replaces balance");
    await db.user.update({
      where: { id: user.id },
      data: { credits: 200, subscriptionStatus: "ACTIVE" },
    });
    await apply("invoice.payment_succeeded", {
      customer: customerId,
      subscription: subscriptionId,
      billing_reason: "subscription_cycle",
      metadata: { planId: "pro" },
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: PRO_CREDITS,
      subscriptionStatus: "ACTIVE",
    });
    assert.equal(billing.shouldRestartBillingPeriod("ACTIVE", "subscription_cycle"), false);

    mark("failed renewal blocks spending");
    await db.user.update({
      where: { id: user.id },
      data: { credits: 900, subscriptionStatus: "ACTIVE" },
    });
    await apply("invoice.payment_failed", {
      customer: customerId,
      subscription: subscriptionId,
      billing_reason: "subscription_cycle",
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: PRO_CREDITS,
      subscriptionStatus: "PAST_DUE",
    });
    const blocked = await getUserCredits(user.id);
    assert.equal(blocked.success, false);

    mark("late renewal payment");
    await apply("invoice.payment_succeeded", {
      customer: customerId,
      subscription: subscriptionId,
      billing_reason: "subscription_cycle",
      metadata: { planId: "pro" },
    });
    await expectState({
      plan: "pro",
      nextPlan: null,
      stripeSubscriptionId: subscriptionId,
      credits: PRO_CREDITS,
      subscriptionStatus: "ACTIVE",
    });
    assert.equal(billing.shouldRestartBillingPeriod("PAST_DUE", "subscription_cycle"), true);
    const open = await getUserCredits(user.id);
    assert.equal(open.success, true);

    mark("deleted saved subscription");
    await apply("customer.subscription.deleted", {
      id: subscriptionId,
      customer: customerId,
      status: "canceled",
    });
    await expectState({
      plan: "free",
      nextPlan: null,
      stripeSubscriptionId: null,
      credits: 0,
      subscriptionStatus: "CANCELED",
    });

    mark("two subscriptions refused");
    const crowded = billing.evaluatePlanRequest({
      requestedPlanId: "pro",
      currentPlanId: "pro",
      activeSubscriptionCount: 2,
    });
    assert.equal(crowded.action, "refuse");
    await expectState({
      plan: "free",
      nextPlan: null,
      stripeSubscriptionId: null,
      credits: 0,
      subscriptionStatus: "CANCELED",
    });

    const expected = [
      "first checkout",
      "first invoice adds nothing",
      "duplicate event",
      "other subscription",
      "unknown plan",
      "second checkout refused",
      "cancel at period end",
      "deleted other subscription",
      "keep pro while cancellation is pending",
      "paid renewal replaces balance",
      "failed renewal blocks spending",
      "late renewal payment",
      "deleted saved subscription",
      "two subscriptions refused",
    ];
    assert.deepEqual(ran, expected);
  } finally {
    await db.stripeEvent.deleteMany({
      where: { id: { startsWith: `evt_${user.id}_` } },
    });
    await db.user.delete({ where: { id: user.id } }).catch(() => undefined);
    await db.$disconnect();
  }
});
