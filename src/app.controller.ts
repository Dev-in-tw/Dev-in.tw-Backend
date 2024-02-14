import { Controller, Get } from "@nestjs/common";


@Controller()
export class AppController {
  @Get()
  getWelcome(): { message: string } {
    return {
      message: "Welcome to Dev-in.tw backend API"
    };
  }
}
