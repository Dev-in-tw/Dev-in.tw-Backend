import { Module } from "@nestjs/common";
import { InfoModule } from "./info/info.module";


@Module({
  imports: [InfoModule]
})
export class UserModule {}
