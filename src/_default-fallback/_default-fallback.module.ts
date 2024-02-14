import { Module } from '@nestjs/common';
import { DefaultFallbackController } from './_default-fallback.controller';

@Module({
  controllers: [DefaultFallbackController]
})
export class DefaultFallbackModule {}
