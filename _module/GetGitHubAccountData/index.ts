import axios from "axios";

import { GitHubEmailApiResponseDto } from "_types/GitHub/email-api-response.dto";
import { GitHubUserDataApiResponseDto } from "_types/GitHub/user-data-api-response.dto";


const GITHUB_ACCESS_TOKEN_API = "https://github.com/login/oauth/access_token";
const GITHUB_USER_DATA_API = "https://api.github.com/user";
const GITHUB_EMAIL_DATA_API = "https://api.github.com/user/emails";

export async function getGitHubAccountData(code: string) {
  try {
    const accessToken = await getAccessToken(code);
    if (!accessToken) {
      throw new Error("Error while getting access token");
    }

    const accountData = await getAccountData(accessToken);
    return accountData;
  }
  catch (error) {
    console.error(error.message);
    return null;
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
    console.error(error.message);
    return null;
  }
}

async function getAccountData(accessToken: string): Promise<any | null> {
  try {
    const userDataResponse = await axios.get(GITHUB_USER_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userData: GitHubUserDataApiResponseDto | null =
      await userDataResponse.data;
    if (!userData) {
      throw new Error("User data not found");
    }

    const userEmailsResponse = await axios.get(GITHUB_EMAIL_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userEmails: [GitHubEmailApiResponseDto] | null =
      await userEmailsResponse.data;
    if (!userEmails) {
      throw new Error("User emails not found");
    }
    const primaryEmail = userEmails.filter((email) => email.primary)[0];

    return { ...userData, primary_email: primaryEmail };
  }
  catch (error) {
    console.error(error.message);
    return null;
  }
}
