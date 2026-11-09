import { NextResponse } from "next/server";
import { withValidation } from "@/lib/validation/api";
import { z } from "zod";
import { db } from "@/lib/db";

const usageQuerySchema = z.object({});

export const GET = withValidation(
  usageQuerySchema,
  async (_req, _data, session) => {
    const targetUserId = session?.user?.id;

    const aggregate = targetUserId
      ? await db.usageLog.aggregate({
          where: { userId: targetUserId },
          _sum: {
            totalTokens: true,
          },
        })
      : { _sum: { totalTokens: 0 } };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTokens: aggregate._sum.totalTokens || 0,
        },
      },
    });
  },
  { requireAuth: true }
);
