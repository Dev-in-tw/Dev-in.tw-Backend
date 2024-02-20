import { All, Controller, HttpCode } from "@nestjs/common";

import { HttpStatus } from "../../_status-code/HTTP";


@Controller("*")
export class DefaultFallbackController {
  @All()
  @HttpCode(HttpStatus.NOT_FOUND)
  incorrectRoute(): { message: string } {
    return {
      message: "Incorrect route"
    };
  }
}
