import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { DefaultFallbackModule } from "../_module/DefaultFallback/default-fallback.module";
import { LoggerMiddleware } from "../_module/AppLogger/logger.middleware";
import { JwtVerifierMiddleware } from "_module/JwtVerifier/jwt-verifier.middleware";
import { TestModule } from "./test/test.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env"
    }),
    TestModule,
    UserModule,
    AuthModule,
    DefaultFallbackModule
  ],
  controllers: [AppController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
    consumer.apply(JwtVerifierMiddleware).forRoutes("user/info");
  }
}
