import { All, Controller, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

// Express 5 / path-to-regexp v8: a bare "*" is no longer a valid pattern.
// "{*splat}" is a named, optional catch-all so it also matches the root path.
@ApiExcludeController()
@Controller("{*splat}")
export class FallbackController {
  @All()
  @HttpCode(HttpStatus.NOT_FOUND)
  incorrectRoute(): { message: string } {
    return { message: "Incorrect route" };
  }
}
