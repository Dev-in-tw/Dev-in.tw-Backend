import { GithubEmailApiResponse } from "./Github/email-api-response";
import { GithubUserDataApiResponse } from "./Github/user-data-api-response";


export type GithubAccountData = {
  primary_email: GithubEmailApiResponse;
} & GithubUserDataApiResponse;
