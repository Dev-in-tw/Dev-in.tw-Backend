import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TestModule } from "./test/test.module";
import { DefaultFallbackModule } from "./_default-fallback/_default-fallback.module";


@Module({
  imports: [TestModule, DefaultFallbackModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
