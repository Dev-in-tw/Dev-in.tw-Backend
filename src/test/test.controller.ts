import { Controller, Get } from "@nestjs/common";


@Controller("test")
export class TestController {
  @Get()
  getTest() {
    return {
      message: "test route"
    };
  }
}
