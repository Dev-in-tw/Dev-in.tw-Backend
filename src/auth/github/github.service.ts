import { Injectable } from "@nestjs/common";
import axios from "axios";

import { GithubEmailApiResponse } from "_types/Github/email-api-response";
import { GithubUserDataApiResponse } from "_types/Github/user-data-api-response";
import { GithubAccountData } from "_types/github-account-data";


const GITHUB_ACCESS_TOKEN_API = "https://github.com/login/oauth/access_token";
const GITHUB_USER_DATA_API = "https://api.github.com/user";
const GITHUB_EMAIL_DATA_API = "https://api.github.com/user/emails";

@Injectable()
export class GithubService {
  async getGitHubAccountData(code: string): Promise<GithubAccountData | null> {
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
): Promise<GithubAccountData | null> {
  try {
    const userDataResponse = await axios.get(GITHUB_USER_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userData: GithubUserDataApiResponse | null =
      await userDataResponse.data;
    if (!userData) {
      throw new Error("User data not found");
    }

    const userEmailsResponse = await axios.get(GITHUB_EMAIL_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userEmails: [GithubEmailApiResponse] | null =
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
