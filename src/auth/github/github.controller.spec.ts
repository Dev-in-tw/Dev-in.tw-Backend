import { Test, TestingModule } from "@nestjs/testing";

import { GithubController } from "./github.controller";
import { GithubService } from "./github.service";

describe("GithubController", () => {
  let controller: GithubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubController],
      providers: [
        {
          provide: GithubService,
          useValue: { login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<GithubController>(GithubController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
