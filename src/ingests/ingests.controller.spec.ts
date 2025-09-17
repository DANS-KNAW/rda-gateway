import { Test, TestingModule } from '@nestjs/testing';
import { IngestsController } from './ingests.controller';
import { IngestsService } from './ingests.service';

describe('IngestsController', () => {
  let controller: IngestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestsController],
      providers: [IngestsService],
    }).compile();

    controller = module.get<IngestsController>(IngestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
