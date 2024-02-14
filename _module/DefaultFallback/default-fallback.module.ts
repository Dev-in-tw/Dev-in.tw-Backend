import { Module } from "@nestjs/common";

import { DefaultFallbackController } from "./default-fallback.controller";


@Module({
  controllers: [DefaultFallbackController]
})
export class DefaultFallbackModule {}
