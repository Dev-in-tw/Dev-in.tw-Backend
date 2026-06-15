import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

/**
 * Catches every unhandled exception and serialises it into a consistent JSON
 * shape. HttpExceptions keep their status/message; Mongoose cast/validation
 * errors map to 400; anything else is a logged 500 with a generic message.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      this.logger.warn(
        `Response already sent; cannot serialise error for ${request.url}`,
      );
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = "Internal Server Error";
    let message: string | string[] = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === "string") {
        message = responseBody;
      } else if (typeof responseBody === "object" && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        message = (body.message as string | string[]) ?? exception.message;
        error = (body.error as string) ?? exception.name;
      }
    } else if (isMongooseClientError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      error = "Bad Request";
      message = "Invalid request data";
    }

    // Log and mask any 5xx so internal details never reach the client.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error
          ? (exception.stack ?? exception.message)
          : JSON.stringify(exception),
      );
      error = "Internal Server Error";
      message = "Internal server error";
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}

/** Detects Mongoose client-side errors (bad ObjectId, schema validation). */
function isMongooseClientError(exception: unknown): boolean {
  return (
    exception instanceof Error &&
    (exception.name === "CastError" || exception.name === "ValidationError")
  );
}
