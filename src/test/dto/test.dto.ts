import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export enum TestMethod {
  Edit = "edit",
  Create = "create",
  Read = "read",
}

export class TestDto {
  @ApiProperty({ enum: TestMethod, enumName: "TestMethod" })
  @IsEnum(TestMethod)
  method: TestMethod;
}
