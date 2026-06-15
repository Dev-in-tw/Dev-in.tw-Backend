import {
  GithubEmailApiResponseDto,
  GithubUserDataApiResponseDto,
} from "./github-api-response.dto";

/** GitHub profile data enriched with the account's primary email. */
export class GithubAccountDataDto extends GithubUserDataApiResponseDto {
  primary_email: GithubEmailApiResponseDto;
}
