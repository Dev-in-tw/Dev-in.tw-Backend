import { plainToInstance } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";

/**
 * Schema for the environment variables the application requires.
 * Used by ConfigModule's `validate` option to fail fast at boot when any
 * required variable is missing or malformed.
 */
class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  MONGO_URI: string;

  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  GITHUB_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  GITHUB_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string;

  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_API_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_ZONE_ID: string;

  @IsString()
  @IsNotEmpty()
  ROOT_DOMAIN: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${errors
        .map((error) => Object.values(error.constraints ?? {}).join(", "))
        .join("\n")}`,
    );
  }

  return validated;
}
