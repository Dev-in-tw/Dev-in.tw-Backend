import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions, JwtSignOptions } from "@nestjs/jwt";

import { GithubModule } from "./github/github.module";

@Module({
  imports: [
    // `global: true` lets any module inject `JwtService` without importing
    // JwtModule itself (avoids re-registering the secret everywhere).
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          // `ms` types expiresIn as a template literal; the env value is a plain
          // string validated at boot, so cast to the expected shape.
          expiresIn: (config.get<string>("JWT_EXPIRES_IN") ??
            "7d") as JwtSignOptions["expiresIn"],
        },
      }),
    }),
    GithubModule,
  ],
})
export class AuthModule {}
