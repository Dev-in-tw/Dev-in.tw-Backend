import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get("user-agent") || "";

    // "finish" fires on a fully-sent response; "close" can also fire on aborts.
    response.on("finish", () => {
      this.logger.log(
        `${method} ${url}\t| ${response.statusCode} | ${ip} ${userAgent}`,
      );
    });

    response.on("close", () => {
      if (!response.writableEnded) {
        this.logger.warn(`${method} ${url}\t| ABORTED | ${ip} ${userAgent}`);
      }
    });

    next();
  }
}
