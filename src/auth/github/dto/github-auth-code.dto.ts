import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GithubAuthCodeDto {
  @ApiProperty({ description: "GitHub OAuth authorization code" })
  @IsString()
  @IsNotEmpty()
  code: string;
}
