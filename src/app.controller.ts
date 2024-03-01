import { Controller, Get } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { HttpStatus } from "_status-code/HTTP";


@Controller()
export class AppController {
  @Get()
  @ApiTags("Welcome")
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        message: {
          type: "string"
        }
      },
      example: {
        message: "Welcome to Dev-in.tw backend API"
      }
    },
    description: "Show welcome message"
  })
  getWelcome(): { message: string } {
    return {
      message: "Welcome to Dev-in.tw backend API"
    };
  }
}
