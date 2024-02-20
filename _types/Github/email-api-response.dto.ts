export class GithubEmailApiResponseDto {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: null | "public" | "private";
}
