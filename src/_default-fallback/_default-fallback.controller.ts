import { Controller, Get } from "@nestjs/common";


@Controller("*")
export class DefaultFallbackController {
  @Get()
  incorrectRoute() {
    return "Incorrect route";
  }
}
