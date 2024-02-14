import { Test, TestingModule } from "@nestjs/testing";

import { DefaultFallbackController } from "../_module/DefaultFallback/default-fallback.controller";


describe("DefaultFallbackController", () => {
  let controller: DefaultFallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefaultFallbackController]
    }).compile();

    controller = module.get<DefaultFallbackController>(
      DefaultFallbackController,
    );
  });

  it("should return an json object with message 'Incorrect route'", () => {
    expect(controller.incorrectRoute()).toStrictEqual({
      message: "Incorrect route"
    });
  });
});
