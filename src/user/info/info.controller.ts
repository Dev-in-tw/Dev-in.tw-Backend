import { Controller, Get, Req, Res } from "@nestjs/common";
import { Response } from "express";

import { InfoService } from "./info.service";
import { HttpStatus } from "_status-code/HTTP";
import { VerifiedRequest } from "_types/request";


@Controller("user/info")
export class InfoController {
  constructor(private infoService: InfoService) {}

  @Get()
  async getUserInfo(@Req() req: VerifiedRequest, @Res() res: Response) {
    try {
      const userInfo = await this.infoService.getUserInfo(req.githubId);

      return res.status(HttpStatus.OK).json(userInfo);
    }
    catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: "Please provide a valid token"
      });
    }
  }
}
