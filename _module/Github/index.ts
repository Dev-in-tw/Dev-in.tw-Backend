import { getAccessToken } from "./functions/getAccessToken";
import { getAccountData } from "./functions/getAccountData";


export class Github {
  static async getAccountData(accessToken: string) {
    return await getAccountData(accessToken);
  }

  static async getAccessToken(code: string) {
    return await getAccessToken(code);
  }
}
