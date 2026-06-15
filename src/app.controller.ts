import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("app")
@Controller()
export class AppController {
  @Get()
  getWelcome(): { message: string } {
    return { message: "Welcome to Dev-in.tw backend API" };
  }
}
