import pino from "pino";
import { env } from "@/lib/env";

const isDev = env.NODE_ENV === "development";

export const logger = pino({
  level: env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
  base: {
    service: "ai-starter-community",
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function logRequest(params: {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId?: string;
  error?: string;
}) {
  const { method, path, status, durationMs, userId, error } = params;
  const logData = {
    method,
    path,
    status,
    durationMs: `${durationMs.toFixed(2)}ms`,
    userId: userId || "anonymous",
    error,
  };

  if (status >= 500) {
    logger.error(logData, `[HTTP] ${method} ${path} ${status} - ${durationMs.toFixed(2)}ms`);
  } else if (status >= 400) {
    logger.warn(logData, `[HTTP] ${method} ${path} ${status} - ${durationMs.toFixed(2)}ms`);
  } else {
    logger.info(logData, `[HTTP] ${method} ${path} ${status} - ${durationMs.toFixed(2)}ms`);
  }
}
