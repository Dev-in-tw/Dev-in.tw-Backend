import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { DefaultFallbackModule } from "../_module/DefaultFallback/default-fallback.module";
import { LoggerMiddleware } from "../_module/AppLogger/logger.middleware";
import { TestModule } from "./test/test.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env"
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>("MONGO_URI") + "?authSource=admin"
      })
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
  }
}
