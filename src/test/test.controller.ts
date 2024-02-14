import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";


@Controller("test")
export class TestController {
  @Get()
  getTest(@Res() res: Response) {
    return res.status(200).json({
      test: "test",
    });
  }
}
