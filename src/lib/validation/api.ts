import { NextRequest, NextResponse } from "next/server";
import { ZodType, ZodError, z } from "zod";
import { AppError } from "@/lib/errors";
import { logRequest } from "@/lib/logger";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

export type AuthenticatedHandler<T> = (
  req: NextRequest,
  data: T,
  session: Session | null
) => Promise<Response | NextResponse>;

export interface ValidationOptions {
  requireAuth?: boolean;
  routeLabel?: string;
}

export function withValidation<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  handler: AuthenticatedHandler<z.infer<TSchema>>,
  options: ValidationOptions = {}
) {
  const { requireAuth = false, routeLabel } = options;

  return async (req: NextRequest): Promise<Response> => {
    const startTime = performance.now();
    const method = req.method;
    const path = routeLabel || req.nextUrl.pathname;
    let status = 200;
    let userId: string | undefined;

    try {
      // 1. Session Authentication check
      let session: Session | null = null;
      try {
        session = await auth();
        if (session?.user?.id) {
          userId = session.user.id;
        }
      } catch {
        // session lookup failed or not configured
      }

      if (requireAuth && !session?.user) {
        status = 401;
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required to access this resource",
            },
          },
          { status: 401 }
        );
      }

      // 2. Body parsing & Zod Validation
      let body: unknown = {};
      if (method !== "GET" && method !== "DELETE") {
        try {
          body = await req.json();
        } catch {
          body = {};
        }
      } else {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
        body = searchParams;
      }

      const parsedData = schema.parse(body);

      // 3. Execute Handler
      const response = await handler(req, parsedData, session);
      status = response.status;
      return response;
    } catch (error: unknown) {
      let message = "An unexpected error occurred";
      let code = "INTERNAL_SERVER_ERROR";
      let details: unknown = undefined;

      if (error instanceof ZodError) {
        status = 400;
        code = "VALIDATION_ERROR";
        message = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        details = error.errors;
      } else if (error instanceof AppError) {
        status = error.statusCode;
        code = error.code;
        message = error.message;
        details = error.details;
      } else if (error instanceof Error) {
        message = error.message;
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code,
            message,
            details,
          },
        },
        { status }
      );
    } finally {
      const durationMs = performance.now() - startTime;
      logRequest({
        method,
        path,
        status,
        durationMs,
        userId,
      });
    }
  };
}
