import { Body, Controller, Get, Post } from "@nestjs/common";

import { getGitHubAccountData } from "_module/GetGitHubAccountData";
import { GithubCodeDto } from "_types/github-code.dto";


@Controller("test")
export class TestController {
  @Get()
  getTest() {
    return {
      message: "test route"
    };
  }

  @Post()
  async postTest(@Body() GithubCodeDto: GithubCodeDto) {
    const accountData = await getGitHubAccountData(GithubCodeDto.code);
    return { data: accountData };
  }
}
