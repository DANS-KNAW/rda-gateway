import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesController } from './vocabularies.controller';
import { VocabulariesService } from './vocabularies.service';

describe('VocabulariesController', () => {
  let controller: VocabulariesController;
  let service: jest.Mocked<VocabulariesService>;

  const vocabulariesServiceMock: Partial<jest.Mocked<VocabulariesService>> = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabulariesController],
      providers: [
        {
          provide: VocabulariesService,
          useValue: vocabulariesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<VocabulariesController>(VocabulariesController);
    service = module.get<VocabulariesService>(
      VocabulariesService,
    ) as jest.Mocked<VocabulariesService>;

    // This will allow use to repeatly use the same mock object.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
