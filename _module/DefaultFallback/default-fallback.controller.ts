import { All, Controller, HttpCode } from "@nestjs/common";

import { HttpStatus } from "../../_StatusCode/HTTP";


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
