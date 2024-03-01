import { All, Controller, HttpCode } from "@nestjs/common";
import { ApiResponse, ApiResponseProperty, ApiTags } from "@nestjs/swagger";

import { HttpStatus } from "../../_status-code/HTTP";


@Controller("*")
export class DefaultFallbackController {
  @All()
  @HttpCode(HttpStatus.NOT_FOUND)
  @ApiTags("Default Fallback")
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Incorrect route"
  })
  @ApiResponseProperty({
    type: "object",
    example: {
      message: "Incorrect route"
    }
  })
  incorrectRoute(): { message: string } {
    return {
      message: "Incorrect route"
    };
  }
}
