import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { TestController } from "./test.controller";


@Module({
  controllers: [TestController],
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000,
        limit: 10
      }
    ])
  ]
})
export class TestModule {}
