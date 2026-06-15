import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

import { JwtPayload } from "../dto/jwt-payload";

/**
 * Hand-rolled JWT guard (no passport). Extracts the Bearer token from the
 * Authorization header, verifies it, and attaches the decoded payload to
 * `request.user` for downstream `@CurrentUser()` decorators.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing authentication token");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
