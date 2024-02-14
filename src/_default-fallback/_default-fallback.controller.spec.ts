import { Test, TestingModule } from '@nestjs/testing';
import { DefaultFallbackController } from './_default-fallback.controller';

describe('DefaultFallbackController', () => {
  let controller: DefaultFallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefaultFallbackController],
    }).compile();

    controller = module.get<DefaultFallbackController>(DefaultFallbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
