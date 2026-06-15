import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";

import { UserService } from "../../user/user.service";
import { JwtPayload } from "../dto/jwt-payload";
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

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Full login flow: exchange the OAuth code for GitHub profile data, upsert the
   * user (keyed by GitHub id), then sign and return a JWT for the frontend.
   */
  async login(code: string): Promise<{ token: string }> {
    const data = await this.getGitHubAccountData(code);

    const user = await this.userService.upsertByGithubId(String(data.id), {
      githubId: String(data.id),
      name: data.name ?? data.login,
      avatar: data.avatar_url,
      email: data.email ?? data.primary_email.email,
      primaryEmail: data.primary_email.email,
    });

    const payload: JwtPayload = { sub: user.id };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }

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
