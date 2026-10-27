import { NextResponse } from "next/server";
import { withValidation } from "@/lib/validation/api";
import { customerPortalSchema } from "@/lib/validation/stripe.schema";
import { createCustomerPortalSession } from "@/services/stripe/subscription";

export const POST = withValidation(
  customerPortalSchema,
  async (_req, data, session) => {
    const userId = session!.user!.id;
    const userEmail = session!.user!.email || "";
    const { returnUrl, flow } = data;

    const result = await createCustomerPortalSession({
      userId,
      userEmail,
      returnUrl,
      flow,
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
  { requireAuth: true, routeLabel: "/api/stripe/portal" }
);
