import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { GithubAccountDataDto } from "./dto/github-account-data.dto";
import { GithubAuthCodeDto } from "./dto/github-auth-code.dto";
import { GithubService } from "./github.service";

@ApiTags("auth")
@Controller("auth/github")
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async getGitHubAccountData(
    @Body() body: GithubAuthCodeDto,
  ): Promise<{ account_data: GithubAccountDataDto }> {
    const accountData = await this.githubService.getGitHubAccountData(
      body.code,
    );

    return { account_data: accountData };
  }
}
