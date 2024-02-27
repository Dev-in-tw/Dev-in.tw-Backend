export type GithubEmailApiResponse = {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: null | "public" | "private";
};
