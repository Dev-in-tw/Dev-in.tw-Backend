import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { AModule } from './a/a.module';

@Module({
  controllers: [TestController],
  imports: [AModule]
})
export class TestModule {}
