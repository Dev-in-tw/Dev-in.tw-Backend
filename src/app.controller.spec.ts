import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";


describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return an json object which contains welcome message", () => {
      expect(appController.getWelcome()).toStrictEqual({
        message: "Welcome to Dev-in.tw backend API"
      });
    });
  });
});
