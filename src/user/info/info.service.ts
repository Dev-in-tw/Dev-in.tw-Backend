import { Injectable } from "@nestjs/common";
import { CustomError } from "_module/CustomError";

import { User as UserDB } from "_module/Database";


@Injectable()
export class InfoService {
  async getUserInfoByGithubId(githubId: string) {
    try {
      return await UserDB.read.byGithubId(githubId);
    }
    catch (error) {
      new CustomError(`Invalid github id '${githubId}'`).default();
    }
  }

  async getUserInfoByUserName(userName: string) {
    try {
      return await UserDB.read.byUserName(userName);
    }
    catch (error) {
      new CustomError(`Invalid user name '${userName}'`).default();
    }
  }
}
