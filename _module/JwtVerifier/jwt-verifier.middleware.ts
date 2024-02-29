import { Injectable, NestMiddleware } from "@nestjs/common";
import { Response } from "express";

import { VerifiedRequest } from "_types/request";
import { HttpStatus } from "_status-code/HTTP";
import { JWT } from "_module/JWT";
import { CustomError } from "_module/CustomError";


@Injectable()
export class JwtVerifierMiddleware implements NestMiddleware {
  use(req: VerifiedRequest, res: Response, next: () => void) {
    try {
      const token = req.headers.authorization.split(" ");

      if (token.length === 2 && token[0] === "Bearer" && token[1]) {
        const decoded = new JWT(token[1]).verify();

        req.JWT = token[1];
        req.githubId = decoded.githubId;

        next();
      }
      else {
        new CustomError("Invalid token provided").default();
      }
    }
    catch (error) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: "Please provide a valid token" });
    }
  }
}
