import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { GithubAuthCodeDto } from "./dto/github-auth-code.dto";
import { GithubService } from "./github.service";

@ApiTags("auth")
@Controller("auth/github")
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: GithubAuthCodeDto): Promise<{ token: string }> {
    return this.githubService.login(body.code);
  }
}
