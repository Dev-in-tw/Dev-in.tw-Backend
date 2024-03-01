import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { GithubService } from "./github.service";
import { HttpStatus } from "_status-code/HTTP";
import { GithubAuthCodeDto } from "_types/github-auth-code.dto";
import { JWT } from "_module/JWT";


@Controller("auth/github")
export class GithubController {
  constructor(private githubService: GithubService) {}

  @Post()
  @ApiTags("GitHub Login")
  async getGitHubAccountData(
    @Body() data: GithubAuthCodeDto,
    @Res() res: Response,
  ) {
    try {
      const githubAccountData = await this.githubService.getGitHubAccountData(
        data.code,
      );

      const userAccountData = await this.githubService.upsertUser(
        githubAccountData,
      );

      const token = new JWT({
        githubId: userAccountData.githubId
      }).sign();

      return res.status(HttpStatus.OK).json({
        accountData: userAccountData,
        token
      });
    }
    catch (error) {
      console.error(error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: "Please provide a valid authentication code"
      });
    }
  }
}
