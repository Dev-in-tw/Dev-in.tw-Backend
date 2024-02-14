import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

import { Request, Response, NextFunction } from "express";


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get("user-agent") || "";

    response.on("close", () => {
      const { statusCode } = response;
      // const contentLength = response.get("content-length");

      this.logger.log(
        // `${method} ${url}\n\tStatus Code:\t${statusCode}\n\tContent Length:\t${contentLength}\n\tIP:\t\t${ip}\n\tUser Agent:\t${userAgent}`,
        `${method} ${url}\t| ${statusCode} | ${ip} ${userAgent}`,
      );
    });

    next();
  }
}
