import axios from "axios";

import { GithubEmailApiResponse } from "_types/Github/email-api-response";
import { GithubUserDataApiResponse } from "_types/Github/user-data-api-response";
import { GithubAccountData } from "_types/github-account-data";
import { CustomError } from "_module/CustomError";


const GITHUB_USER_DATA_API = "https://api.github.com/user";
const GITHUB_EMAIL_DATA_API = "https://api.github.com/user/emails";

export async function getAccountData(
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
      new CustomError(
        `User data not found with access token '${accessToken}'`,
      ).default();
    }

    const userEmailsResponse = await axios.get(GITHUB_EMAIL_DATA_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userEmails: [GithubEmailApiResponse] | null =
      await userEmailsResponse.data;
    if (!userEmails) {
      new CustomError("User emails not found").default();
    }

    const primaryEmail = userEmails.find((email) => email.primary);
    if (!primaryEmail) {
      new CustomError(
        `Primary email not found in user emails:\n${JSON.stringify(
          userEmails,
          null,
          2,
        )}`,
      ).default();
    }

    return { ...userData, primary_email: primaryEmail };
  }
  catch (error) {
    new CustomError(
      `Error while getting user data from GitHub, error: ${error.message}`,
    ).func(getAccountData);
  }
}
