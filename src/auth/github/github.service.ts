import { Injectable } from "@nestjs/common";
import axios from "axios";

import { GithubEmailApiResponseDto } from "_types/Github/email-api-response.dto";
import { GithubUserDataApiResponseDto } from "_types/Github/user-data-api-response.dto";
import { GithubAccountDataDto } from "_types/github-account-data.dto";


const GITHUB_ACCESS_TOKEN_API = "https://github.com/login/oauth/access_token";
const GITHUB_USER_DATA_API = "https://api.github.com/user";
const GITHUB_EMAIL_DATA_API = "https://api.github.com/user/emails";

@Injectable()
export class GithubService {
  async getGitHubAccountData(
    code: string,
  ): Promise<GithubAccountDataDto | null> {
    try {
      const accessToken = await getAccessToken(code);
      const accountData = await getAccountData(accessToken);

      return accountData;
    }
    catch (error) {
      throw new Error("Error while getting GitHub account data");
    }
  }
}

async function getAccessToken(code: string): Promise<string | null> {
  try {
    const accessTokenResponse = await axios.post(
      GITHUB_ACCESS_TOKEN_API,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        scope: "user:email",
        code
      },
      {
        headers: {
          Accept: "application/json"
        }
      },
    );
    const { access_token: accessToken } = await accessTokenResponse.data;
    if (!accessToken) {
      throw new Error("Access token not found");
    }

    return accessToken;
  }
  catch (error) {
    throw new Error("Error while getting access token");
  }
}

async function getAccountData(
  accessToken: string,
): Promise<GithubAccountDataDto | null> {
  try {
    const userDataResponse = await axios.get(GITHUB_USER_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userData: GithubUserDataApiResponseDto | null =
      await userDataResponse.data;
    if (!userData) {
      throw new Error("User data not found");
    }

    const userEmailsResponse = await axios.get(GITHUB_EMAIL_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userEmails: [GithubEmailApiResponseDto] | null =
      await userEmailsResponse.data;
    if (!userEmails) {
      throw new Error("User emails not found");
    }

    const primaryEmail = userEmails.find((email) => email.primary);
    if (!primaryEmail) {
      throw new Error("Primary email not found");
    }

    return { ...userData, primary_email: primaryEmail };
  }
  catch (error) {
    throw new Error("Error while getting account data");
  }
}
