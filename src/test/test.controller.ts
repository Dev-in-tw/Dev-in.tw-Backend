import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { TestDto } from "_types/test.dto";
import { HttpStatus } from "_status-code/HTTP";
import { CustomError } from "_module/CustomError";
import { User as UserDB } from "_module/Database";


@Controller("test")
export class TestController {
  @Get()
  @ApiTags("Test")
  getTest() {
    return {
      message: "test route"
    };
  }

  @Post()
  @ApiTags("Test")
  async getGitHubAccountData(@Body() input: TestDto, @Res() res: Response) {
    try {
      let data: any;
      switch (input.method) {
        case "edit": {
          data = await UserDB.edit.byId("65dcb453b3d5725f6b936850", {
            githubId: "test data"
          });
          break;
        }

        case "create": {
          data = await UserDB.write.create({
            githubId: "test data"
          });
          break;
        }

        case "read": {
          data = await UserDB.read.byId("65dcb453b3d5725f6b936850");
          break;
        }

        default: {
          new CustomError("Invalid method provided").default();
        }
      }

      return res.status(HttpStatus.OK).json({
        data
      });
    }
    catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: error.message
      });
    }
  }
}
