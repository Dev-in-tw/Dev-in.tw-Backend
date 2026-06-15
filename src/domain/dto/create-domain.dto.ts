import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

import { SUBDOMAIN_REGEX } from "../constants/reserved-names";

export class CreateDomainDto {
  @ApiProperty({ description: 'Subdomain label to register, e.g. "alice"' })
  @Matches(SUBDOMAIN_REGEX, {
    message:
      "name must be a valid subdomain label (lowercase letters, digits and hyphens, not starting or ending with a hyphen)",
  })
  name: string;

  @ApiProperty({ description: "Registrant first name" })
  @IsString()
  first_name: string;

  @ApiProperty({ description: "Registrant last name" })
  @IsString()
  last_name: string;

  @ApiProperty({ description: "Registrant date of birth (ISO date string)" })
  @IsString()
  birth: string;

  @ApiProperty({ description: "Registrant national identity id" })
  @IsString()
  identy_id: string;

  @ApiProperty({ description: "Registrant address" })
  @IsString()
  address: string;

  @ApiProperty({ description: "Registrant phone number" })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: "Optional domain description" })
  @IsOptional()
  @IsString()
  description?: string;
}
