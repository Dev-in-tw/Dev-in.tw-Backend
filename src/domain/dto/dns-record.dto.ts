import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from "class-validator";

const DNS_RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "SRV",
  "CAA",
] as const;

export class DnsRecordDto {
  @ApiProperty({ enum: DNS_RECORD_TYPES, description: "DNS record type" })
  @IsIn(DNS_RECORD_TYPES)
  type: (typeof DNS_RECORD_TYPES)[number];

  @ApiProperty({
    description: 'Fully-qualified record name, e.g. "alice.dev-in.tw"',
  })
  @IsString()
  name: string;

  @ApiProperty({ description: "Record content (target value)" })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: "TTL in seconds (1 = automatic)" })
  @IsOptional()
  @IsInt()
  ttl?: number;

  @ApiPropertyOptional({
    description: "Whether the record is proxied through Cloudflare",
  })
  @IsOptional()
  @IsBoolean()
  proxied?: boolean;

  @ApiPropertyOptional({ description: "Optional comment for the record" })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateDnsRecordDto {
  @ApiPropertyOptional({
    enum: DNS_RECORD_TYPES,
    description: "DNS record type",
  })
  @IsOptional()
  @IsIn(DNS_RECORD_TYPES)
  type?: (typeof DNS_RECORD_TYPES)[number];

  @ApiPropertyOptional({
    description: 'Fully-qualified record name, e.g. "alice.dev-in.tw"',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Record content (target value)" })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: "TTL in seconds (1 = automatic)" })
  @IsOptional()
  @IsInt()
  ttl?: number;

  @ApiPropertyOptional({
    description: "Whether the record is proxied through Cloudflare",
  })
  @IsOptional()
  @IsBoolean()
  proxied?: boolean;

  @ApiPropertyOptional({ description: "Optional comment for the record" })
  @IsOptional()
  @IsString()
  comment?: string;
}
