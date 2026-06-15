import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

import { GithubAccountDataDto } from "./dto/github-account-data.dto";
import {
  GithubEmailApiResponseDto,
  GithubUserDataApiResponseDto,
} from "./dto/github-api-response.dto";

const GITHUB_ACCESS_TOKEN_API = "https://github.com/login/oauth/access_token";
const GITHUB_USER_DATA_API = "https://api.github.com/user";
const GITHUB_EMAIL_DATA_API = "https://api.github.com/user/emails";

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly configService: ConfigService) {}

  async getGitHubAccountData(code: string): Promise<GithubAccountDataDto> {
    try {
      const accessToken = await this.getAccessToken(code);
      return await this.getAccountData(accessToken);
    } catch (error) {
      this.logger.error(
        "GitHub OAuth exchange failed",
        error instanceof Error ? error.stack : String(error),
      );
      throw new UnauthorizedException(
        "Please provide a valid authentication code",
      );
    }
  }

  private async getAccessToken(code: string): Promise<string> {
    const response = await axios.post(
      GITHUB_ACCESS_TOKEN_API,
      {
        client_id: this.configService.getOrThrow<string>("GITHUB_CLIENT_ID"),
        client_secret: this.configService.getOrThrow<string>(
          "GITHUB_CLIENT_SECRET",
        ),
        scope: "user:email",
        code,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken: string | undefined = response.data?.access_token;
    if (!accessToken) {
      throw new Error("Access token not found");
    }

    return accessToken;
  }

  private async getAccountData(
    accessToken: string,
  ): Promise<GithubAccountDataDto> {
    const headers = { Authorization: `Bearer ${accessToken}` };

    // The profile and email endpoints are independent — fetch them in parallel.
    const [userDataResponse, userEmailsResponse] = await Promise.all([
      axios.get<GithubUserDataApiResponseDto>(GITHUB_USER_DATA_API, {
        headers,
      }),
      axios.get<GithubEmailApiResponseDto[]>(GITHUB_EMAIL_DATA_API, {
        headers,
      }),
    ]);

    const userData = userDataResponse.data;
    if (!userData) {
      throw new Error("User data not found");
    }

    const primaryEmail = userEmailsResponse.data?.find(
      (email) => email.primary,
    );
    if (!primaryEmail) {
      throw new Error("Primary email not found");
    }

    return { ...userData, primary_email: primaryEmail };
  }
}
