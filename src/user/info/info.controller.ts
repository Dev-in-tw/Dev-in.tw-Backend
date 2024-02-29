import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { Response } from "express";

import { InfoService } from "./info.service";
import { VerifiedRequest } from "_types/request";
import { UserPublic } from "_types/database/user";
import { HttpStatus } from "_status-code/HTTP";


@Controller("user/info")
export class InfoController {
  constructor(private infoService: InfoService) {}

  @Get()
  async getUserInfo(@Req() req: VerifiedRequest, @Res() res: Response) {
    try {
      const userInfo = await this.infoService.getUserInfoByGithubId(
        req.githubId,
      );

      return res.status(HttpStatus.OK).json({ accountData: userInfo });
    }
    catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: "Please provide a valid token"
      });
    }
  }

  @Get(":userName")
  async getUserInfoByUserName(
    @Res() res: Response,
    @Param("userName") userName: string,
  ) {
    try {
      const userInfo = await this.infoService.getUserInfoByUserName(userName);
      const publicInfo: UserPublic = {
        id: userInfo.id,
        userName: userInfo.userName,
        name: userInfo.name,
        avatar: userInfo.avatar,
        description: userInfo.description,
        badge: userInfo.badge,
        disabled: userInfo.disabled,
        premium: userInfo.premium,
        createdAt: userInfo.createdAt
      };

      return res.status(HttpStatus.OK).json({
        accountData: publicInfo
      });
    }
    catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: "Please provide a valid user name"
      });
    }
  }
}
