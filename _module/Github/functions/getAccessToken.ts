import axios from "axios";

import { CustomError } from "_module/CustomError";


const GITHUB_ACCESS_TOKEN_API = "https://github.com/login/oauth/access_token";

export async function getAccessToken(code: string): Promise<string | null> {
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
      new CustomError(`Access token not found with code '${code}'`).default();
    }

    return accessToken;
  }
  catch (error) {
    new CustomError(
      `Error while getting access token with code '${code}'`,
    ).func(getAccessToken);
  }
}
