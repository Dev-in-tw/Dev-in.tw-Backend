import { Test, TestingModule } from "@nestjs/testing";

import { FallbackController } from "./fallback.controller";

describe("FallbackController", () => {
  let controller: FallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FallbackController],
    }).compile();

    controller = module.get<FallbackController>(FallbackController);
  });

  it("should return an json object with message 'Incorrect route'", () => {
    expect(controller.incorrectRoute()).toStrictEqual({
      message: "Incorrect route",
    });
  });
});
