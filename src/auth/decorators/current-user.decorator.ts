import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

import { JwtPayload } from "../dto/jwt-payload";

/**
 * Resolves to the JWT payload that `JwtAuthGuard` attached to `request.user`.
 * Must be used on routes protected by `JwtAuthGuard`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as JwtPayload;
  },
);
