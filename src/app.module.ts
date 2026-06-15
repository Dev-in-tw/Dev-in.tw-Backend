import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CloudflareModule } from "./cloudflare/cloudflare.module";
import { FallbackModule } from "./common/fallback/fallback.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { validateEnv } from "./config/env.validation";
import { DomainModule } from "./domain/domain.module";
import { TestModule } from "./test/test.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGO_URI"),
        authSource: "admin",
      }),
    }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 100 }]),
    TestModule,
    UserModule,
    AuthModule,
    CloudflareModule,
    DomainModule,
    // FallbackModule must stay LAST so its catch-all route does not shadow others.
    FallbackModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Express 5: "*" -> named wildcard "{*splat}"
    consumer.apply(LoggerMiddleware).forRoutes("{*splat}");
  }
}
