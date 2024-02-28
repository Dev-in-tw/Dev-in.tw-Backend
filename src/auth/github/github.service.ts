import { Injectable } from "@nestjs/common";

import { GithubAccountData } from "_types/github-account-data";
import { CustomError } from "_module/CustomError";
import { Github as GitHubAPI } from "_module/Github";
import { User as UserDB } from "_module/Database";


@Injectable()
export class GithubService {
  async getGitHubAccountData(code: string): Promise<GithubAccountData | null> {
    try {
      const accessToken = await GitHubAPI.getAccessToken(code);
      const accountData = await GitHubAPI.getAccountData(accessToken);

      return accountData;
    }
    catch (error) {
      new CustomError(
        `Error while getting GitHub account data, error: ${error.message}`,
      ).default();
    }
  }
}
