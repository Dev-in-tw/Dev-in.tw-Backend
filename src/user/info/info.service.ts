import { Injectable } from "@nestjs/common";

import { User as UserDB } from "_module/Database";


@Injectable()
export class InfoService {
  async getUserInfo(githubId: string) {
    return await UserDB.read.byGithubId(githubId);
  }
}
