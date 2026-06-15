import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import axios from "axios";

import { GithubService } from "./github.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to build a minimal axios-like response for mocking.
const axiosResponse = (data: unknown) => ({ data }) as never;

describe("GithubService", () => {
  let service: GithubService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue("test-credential"),
          },
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("returns account data enriched with the primary email on success", async () => {
    mockedAxios.post.mockResolvedValueOnce(
      axiosResponse({ access_token: "tok" }),
    );
    mockedAxios.get
      .mockResolvedValueOnce(axiosResponse({ login: "octocat", id: 1 }))
      .mockResolvedValueOnce(
        axiosResponse([
          { email: "secondary@example.com", primary: false },
          { email: "primary@example.com", primary: true },
        ]),
      );

    const result = await service.getGitHubAccountData("valid-code");

    expect(result.login).toBe("octocat");
    expect(result.primary_email.email).toBe("primary@example.com");
  });

  it("throws UnauthorizedException when GitHub returns no access token", async () => {
    mockedAxios.post.mockResolvedValueOnce(axiosResponse({}));

    await expect(
      service.getGitHubAccountData("bad-code"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
