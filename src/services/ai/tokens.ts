import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Result, success, failure, ErrorFactory } from "@/lib/errors";

export interface RecordUsageParams {
  userId: string;
  promptTokens: number;
  completionTokens: number;
  endpoint: "/chat";
}

function creditsForTokens(totalTokens: number): number {
  return Math.max(1, Math.ceil(totalTokens / 1000));
}

export async function getUserCredits(
  userId: string
): Promise<Result<{ credits: number }>> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true, subscriptionStatus: true },
    });

    if (!user) {
      return ErrorFactory.notFound("User");
    }

    if (user.subscriptionStatus === "PAST_DUE") {
      return ErrorFactory.subscriptionPastDue();
    }

    return success({ credits: user.credits });
  } catch (err: unknown) {
    logger.error({ err, userId }, "Failed to load credit balance");
    return failure("Failed to load credit balance", "DATABASE_ERROR");
  }
}

export async function recordUsageAndDeductCredits(
  params: RecordUsageParams
): Promise<Result<{ remainingCredits: number; creditsDeducted: number }>> {
  try {
    const { userId, promptTokens, completionTokens, endpoint } = params;
    const totalTokens = promptTokens + completionTokens;
    const creditsDeducted = creditsForTokens(totalTokens);

    const billed = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, subscriptionStatus: true },
      });
      if (!user) {
        return null;
      }
      if (user.subscriptionStatus === "PAST_DUE") {
        return "past_due" as const;
      }

      const remainingCredits = Math.max(0, user.credits - creditsDeducted);

      await tx.user.update({
        where: { id: userId },
        data: { credits: remainingCredits },
      });

      await tx.usageLog.create({
        data: {
          userId,
          promptTokens,
          completionTokens,
          totalTokens,
          endpoint,
        },
      });

      return remainingCredits;
    });

    if (billed === null) {
      return ErrorFactory.notFound("User");
    }
    if (billed === "past_due") {
      return ErrorFactory.subscriptionPastDue();
    }

    return success({
      remainingCredits: billed,
      creditsDeducted,
    });
  } catch (err: unknown) {
    logger.error({ err }, "Failed to record usage or deduct credits");
    return failure("Failed to record usage log", "INTERNAL_SERVER_ERROR");
  }
}
