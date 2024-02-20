import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { HttpStatus } from "_status-code/HTTP";
import { GithubAuthCodeDto } from "_types/github-auth-code.dto";
import { GithubService } from "./github.service";


@Controller("auth/github")
export class GithubController {
  constructor(private githubService: GithubService) {}

  @Post()
  async getGitHubAccountData(
    @Body() data: GithubAuthCodeDto,
    @Res() res: Response,
  ) {
    try {
      const accountData = await this.githubService.getGitHubAccountData(
        data.code,
      );

      return res.status(HttpStatus.OK).json({
        account_data: accountData
      });
    }
    catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: "Please provide a valid authentication code"
      });
    }
  }
}
