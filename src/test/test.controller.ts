import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { UserService } from "../user/user.service";
import { TestDto, TestMethod } from "./dto/test.dto";

@ApiTags("test")
@Controller("test")
export class TestController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getTest(): { message: string } {
    return { message: "test route" };
  }

  @Post()
  async runUserDbMethod(@Body() body: TestDto): Promise<{ data: unknown }> {
    switch (body.method) {
      case TestMethod.Edit:
        return {
          data: await this.userService.editById("test", {
            githubId: "test data",
          }),
        };

      case TestMethod.Create:
        return {
          data: await this.userService.createNew({ githubId: "test data" }),
        };

      case TestMethod.Read:
        return {
          data: await this.userService.readById("65dcb453b3d5725f6b936850"),
        };

      default:
        throw new BadRequestException("Invalid method provided");
    }
  }
}
