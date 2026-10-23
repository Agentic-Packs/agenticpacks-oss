import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Result, success, failure } from "@/lib/errors";

export interface RecordUsageParams {
  userId: string;
  promptTokens: number;
  completionTokens: number;
  endpoint: "/chat";
}

function creditsForTokens(totalTokens: number): number {
  return Math.max(1, Math.ceil(totalTokens / 1000));
}

export async function recordUsageAndDeductCredits(
  params: RecordUsageParams
): Promise<Result<{ remainingCredits: number; creditsDeducted: number }>> {
  try {
    const { userId, promptTokens, completionTokens, endpoint } = params;
    const totalTokens = promptTokens + completionTokens;
    const creditsDeducted = creditsForTokens(totalTokens);

    if (userId === "demo-user") {
      return success({ remainingCredits: 999, creditsDeducted });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: creditsDeducted,
        },
      },
      select: { credits: true },
    });

    await db.usageLog.create({
      data: {
        userId,
        promptTokens,
        completionTokens,
        totalTokens,
        endpoint,
      },
    });

    return success({
      remainingCredits: updatedUser.credits,
      creditsDeducted,
    });
  } catch (err: unknown) {
    logger.error({ err }, "Failed to record usage or deduct credits");
    return failure("Failed to record usage log", "INTERNAL_SERVER_ERROR");
  }
}
