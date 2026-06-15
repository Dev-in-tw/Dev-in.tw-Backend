import { Module } from "@nestjs/common";

import { UserModule } from "../user/user.module";
import { TestController } from "./test.controller";

@Module({
  imports: [UserModule],
  controllers: [TestController],
})
export class TestModule {}
