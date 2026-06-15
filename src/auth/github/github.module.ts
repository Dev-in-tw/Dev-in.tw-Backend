import { Module } from "@nestjs/common";

import { UserModule } from "../../user/user.module";
import { GithubController } from "./github.controller";
import { GithubService } from "./github.service";

@Module({
  imports: [UserModule],
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
