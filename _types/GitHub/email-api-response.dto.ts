export class GitHubEmailApiResponseDto {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: null | "public" | "private";
}
