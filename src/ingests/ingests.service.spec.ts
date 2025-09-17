import { Test, TestingModule } from '@nestjs/testing';
import { IngestsService } from './ingests.service';
import { getQueueToken } from '@nestjs/bullmq';
import { VOCABULARIES_INGESTION_QUEUE } from './constants/queue-names.constant';

describe('IngestsService', () => {
  let service: IngestsService;
  const mockQueue = {
    add: jest.fn(),
    process: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestsService,
        {
          provide: getQueueToken(VOCABULARIES_INGESTION_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<IngestsService>(IngestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
