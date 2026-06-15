import { Test, TestingModule } from "@nestjs/testing";

import { UserService } from "../user/user.service";
import { TestController } from "./test.controller";

describe("TestController", () => {
  let controller: TestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: UserService,
          useValue: {
            readById: jest.fn(),
            createNew: jest.fn(),
            editById: jest.fn(),
            upsertById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  it("should return a test json object which contains test message", () => {
    expect(controller.getTest()).toStrictEqual({ message: "test route" });
  });
});
