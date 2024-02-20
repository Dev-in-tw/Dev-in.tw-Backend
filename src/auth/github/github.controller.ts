import { Body, Controller, Post } from "@nestjs/common";

import { GithubCodeDto } from "_types/github-code.dto";


@Controller("github")
export class GithubController {
  @Post()
  async getGitHubAccountData(@Body() data: GithubCodeDto) {
    const accountData = await this.getGitHubAccountData(data);
  }
}
