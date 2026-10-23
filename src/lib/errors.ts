export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INSUFFICIENT_CREDITS"
  | "INVALID_API_KEY"
  | "AI_PROVIDER_ERROR"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: AppErrorCode = "INTERNAL_SERVER_ERROR", statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError; code: AppErrorCode };

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<T = never>(
  message: string,
  code: AppErrorCode = "INTERNAL_SERVER_ERROR",
  statusCode = 500,
  details?: unknown
): Result<T> {
  return {
    success: false,
    error: new AppError(message, code, statusCode, details),
    code,
  };
}

export const ErrorFactory = {
  unauthorized: (msg = "Authentication required"): Result<never> =>
    failure(msg, "UNAUTHORIZED", 401),
  forbidden: (msg = "You do not have permission to perform this action"): Result<never> =>
    failure(msg, "FORBIDDEN", 403),
  notFound: (resource = "Resource"): Result<never> =>
    failure(`${resource} not found`, "NOT_FOUND", 404),
  validation: (msg: string, details?: unknown): Result<never> =>
    failure(msg, "VALIDATION_ERROR", 400, details),
  insufficientCredits: (msg = "Insufficient credits remaining."): Result<never> =>
    failure(msg, "INSUFFICIENT_CREDITS", 402),
  invalidApiKey: (msg = "Invalid or missing API key"): Result<never> =>
    failure(msg, "INVALID_API_KEY", 401),
  aiProvider: (msg: string, details?: unknown): Result<never> =>
    failure(msg, "AI_PROVIDER_ERROR", 502, details),
  database: (msg = "Database error occurred"): Result<never> =>
    failure(msg, "DATABASE_ERROR", 500),
  internal: (msg = "Internal server error"): Result<never> =>
    failure(msg, "INTERNAL_SERVER_ERROR", 500),
};
