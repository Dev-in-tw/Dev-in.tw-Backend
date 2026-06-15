import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CloudflareModule } from "../cloudflare/cloudflare.module";
import { UserModule } from "../user/user.module";
import { DomainController } from "./domain.controller";
import { DomainService } from "./domain.service";
import { Domain, DomainSchema } from "./schemas/domain.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Domain.name, schema: DomainSchema }]),
    CloudflareModule,
    UserModule,
  ],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
