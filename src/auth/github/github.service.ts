import { Injectable } from "@nestjs/common";

import { GithubAccountData } from "_types/github-account-data";
import { User, UserWrite } from "_types/database/user";
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

  async upsertUser(githubAccountData: GithubAccountData) {
    try {
      const user: User | null = await UserDB.read
        .byGithubId(githubAccountData.id.toString())
        .catch(() => null);

      const githubDataToDbData: UserWrite = {
        githubId: githubAccountData.id.toString(),
        primaryEmail: githubAccountData.primary_email.email,
        name: githubAccountData.name,
        avatar: githubAccountData.avatar_url,
        description: githubAccountData.bio,
        badge: user?.badge || [],
        beta: user?.beta || false,
        warn: user?.warn || 0,
        disabled: user?.disabled || false,
        premium: user?.premium || false
      };

      if (user) {
        return UserDB.edit.byGithubId(user.githubId, githubDataToDbData);
      }

      return UserDB.write.create(githubDataToDbData);
    }
    catch (error) {
      new CustomError(
        `Error while upserting user, error: ${error.message}`,
      ).default();
    }
  }
}
