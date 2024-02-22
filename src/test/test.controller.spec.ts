import { Test, TestingModule } from "@nestjs/testing";

import { TestController } from "./test.controller";


describe("TestController", () => {
  let controller: TestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController]
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  it("should return a test json object which contains test message", () => {
    expect(controller.getTest()).toStrictEqual({
      message: "test route"
    });
  });
});
