import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesService } from './vocabularies.service';
import { ObjectLiteral, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
});

describe('VocabulariesService', () => {
  let service: VocabulariesService;
  let vocabularyRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabulariesService,
        {
          provide: getRepositoryToken(Vocabulary),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<VocabulariesService>(VocabulariesService);
    vocabularyRepository = module.get<MockRepository>(
      getRepositoryToken(Vocabulary),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(vocabularyRepository).toBeDefined();
  });
});
