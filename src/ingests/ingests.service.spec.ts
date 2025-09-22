import { Test, TestingModule } from '@nestjs/testing';
import { IngestsService } from './ingests.service';

describe('IngestsService', () => {
  let service: IngestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngestsService],
    }).compile();

    service = module.get<IngestsService>(IngestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
