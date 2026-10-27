import { NextResponse } from "next/server";
import { withValidation } from "@/lib/validation/api";
import { checkoutSessionSchema } from "@/lib/validation/stripe.schema";
import { createCheckoutSession } from "@/services/stripe/subscription";

export const POST = withValidation(
  checkoutSessionSchema,
  async (_req, data, session) => {
    const userId = session!.user!.id;
    const userEmail = session!.user!.email || "";
    const { planId, successUrl, cancelUrl } = data;

    const result = await createCheckoutSession({
      userId,
      userEmail,
      planId,
      successUrl,
      cancelUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.toJSON() },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  },
  { requireAuth: true, routeLabel: "/api/stripe/checkout" }
);
