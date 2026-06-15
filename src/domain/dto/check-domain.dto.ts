import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CheckDomainDto {
  @ApiProperty({ description: 'Subdomain label to check, e.g. "alice"' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
