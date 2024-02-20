import { GithubEmailApiResponseDto } from "./Github/email-api-response.dto";
import { GithubUserDataApiResponseDto } from "./Github/user-data-api-response.dto";


export class GithubAccountDataDto extends GithubUserDataApiResponseDto {
  primary_email: GithubEmailApiResponseDto;
}
