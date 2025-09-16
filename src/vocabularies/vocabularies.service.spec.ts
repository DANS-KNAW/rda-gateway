import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesService } from './vocabularies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SelectVocabularyDto } from './dto/select-vocabulary.dto';

/**
 * @TODO The unit tests are functional and the repository is being mocked.
 * However, the types are currently very loose. They should be tightened up.
 * After researching this is the best approach I could find currently but
 * should be revisited in the future.
 */
describe('VocabulariesService', () => {
  let service: VocabulariesService;
  let loggerErrorSpy: jest.SpyInstance;

  type RepoMock = {
    create: jest.Mock;
    find: jest.Mock;
    manager: {
      transaction: jest.Mock;
    };
  };

  const manager = {
    insert: jest.fn(),
    findOne: jest.fn(),
  };

  const repositoryMock: RepoMock = {
    create: jest.fn(),
    find: jest.fn(),
    manager: {
      transaction: jest.fn(
        async (cb: (m: typeof manager) => Promise<Vocabulary>) => cb(manager),
      ),
    },
  };

  const dummyVocabulary: Vocabulary = {
    scheme_uri: 'http://example.com/scheme',
    subject_scheme: 'Test Scheme',
    value_uri: 'http://example.com/value',
    additional_metadata: { key: 'value' },
    deleted_at: null,
    updated_at: new Date(),
    created_at: new Date(),
  };

  const createDto: CreateVocabularyDto = {
    scheme_uri: dummyVocabulary.scheme_uri,
    subject_scheme: dummyVocabulary.subject_scheme,
    value_uri: dummyVocabulary.value_uri,
    additional_metadata: dummyVocabulary.additional_metadata,
  };

  beforeAll(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabulariesService,
        {
          provide: getRepositoryToken(Vocabulary),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<VocabulariesService>(VocabulariesService);
    manager.insert.mockReset();
    manager.findOne.mockReset();
    loggerErrorSpy.mockClear();
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a vocabulary successfully', async () => {
    repositoryMock.create.mockReturnValue(createDto);

    manager.insert.mockResolvedValue({
      identifiers: [
        {
          subject_scheme: createDto.subject_scheme,
          scheme_uri: createDto.scheme_uri,
          value_uri: createDto.value_uri,
        },
      ],
    });
    manager.findOne.mockResolvedValue(dummyVocabulary);

    const result = await service.create(createDto);

    expect(repositoryMock.create).toHaveBeenCalledWith(createDto);
    expect(manager.insert).toHaveBeenCalledWith(Vocabulary, createDto);
    expect(manager.findOne).toHaveBeenCalledWith(Vocabulary, {
      where: {
        subject_scheme: createDto.subject_scheme,
        scheme_uri: createDto.scheme_uri,
        value_uri: createDto.value_uri,
      },
    });
    expect(result).toEqual(dummyVocabulary);
  });

  it('should throw an error if insertion fails', async () => {
    repositoryMock.create.mockReturnValue(createDto);

    manager.insert.mockResolvedValue({ identifiers: [] });

    await expect(service.create(createDto)).rejects.toThrow(
      new InternalServerErrorException('Failure inserting vocabulary'),
    );

    expect(repositoryMock.create).toHaveBeenCalledWith(createDto);
    expect(manager.insert).toHaveBeenCalledWith(Vocabulary, createDto);
    expect(manager.findOne).not.toHaveBeenCalled();
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if vocabulary not found after insertion', async () => {
    repositoryMock.create.mockReturnValue(createDto);

    manager.insert.mockResolvedValue({
      identifiers: [
        {
          subject_scheme: createDto.subject_scheme,
          scheme_uri: createDto.scheme_uri,
          value_uri: createDto.value_uri,
        },
      ],
    });
    manager.findOne.mockResolvedValue(null);

    await expect(service.create(createDto)).rejects.toThrow(
      new NotFoundException(
        'Vocabulary not found after insertion. Please try again.',
      ),
    );
    expect(repositoryMock.create).toHaveBeenCalledWith(createDto);
    expect(manager.insert).toHaveBeenCalledWith(Vocabulary, createDto);
    expect(manager.findOne).toHaveBeenCalledWith(Vocabulary, {
      where: {
        subject_scheme: createDto.subject_scheme,
        scheme_uri: createDto.scheme_uri,
        value_uri: createDto.value_uri,
      },
    });
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should find all vocabularies (no filter)', async () => {
    const vocabularies = Array.from({ length: 51 }, (_, i) => ({
      ...dummyVocabulary,
      value_uri: `${dummyVocabulary.value_uri}${i}`,
    }));
    repositoryMock.find.mockResolvedValue(vocabularies.slice(0, 50));

    const results = await service.find({});

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: {},
      take: 50,
      skip: undefined,
    });
    expect(results.length).toBe(50);
    expect(results).toEqual(vocabularies.slice(0, 50));
  });

  it('should find vocabularies with specific filters', async () => {
    const filter: SelectVocabularyDto = {
      subject_scheme: dummyVocabulary.subject_scheme,
      scheme_uri: dummyVocabulary.scheme_uri,
      value_uri: undefined,
      amount: 10,
      offset: 5,
    };

    const vocabularies = Array.from({ length: 20 }, (_, i) => ({
      ...dummyVocabulary,
      value_uri: `${dummyVocabulary.value_uri}${i}`,
    }));
    repositoryMock.find.mockResolvedValue(vocabularies.slice(5, 15));

    const results = await service.find(filter);

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: {
        subject_scheme: filter.subject_scheme,
        scheme_uri: filter.scheme_uri,
        value_uri: undefined,
      },
      take: 10,
      skip: 5,
    });
    expect(results.length).toBe(10);
    expect(results).toEqual(vocabularies.slice(5, 15));
  });

  it('should find a specific vocabulary with exact filters', async () => {
    const filter: SelectVocabularyDto = {
      subject_scheme: dummyVocabulary.subject_scheme,
      scheme_uri: dummyVocabulary.scheme_uri,
      value_uri: dummyVocabulary.value_uri,
    };

    repositoryMock.find.mockResolvedValue([dummyVocabulary]);

    const results = await service.find(filter);

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: {
        subject_scheme: filter.subject_scheme,
        scheme_uri: filter.scheme_uri,
        value_uri: filter.value_uri,
      },
      take: 50,
      skip: undefined,
    });
    expect(results.length).toBe(1);
    expect(results).toEqual([dummyVocabulary]);
  });

  it('should throw if no vocabularies found', async () => {
    const filter: SelectVocabularyDto = {
      subject_scheme: dummyVocabulary.subject_scheme,
      scheme_uri: dummyVocabulary.scheme_uri,
      value_uri: dummyVocabulary.value_uri,
    };

    repositoryMock.find.mockResolvedValue([]);

    await expect(service.find(filter)).rejects.toThrow(
      new NotFoundException('No vocabularies found'),
    );

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: {
        subject_scheme: filter.subject_scheme,
        scheme_uri: filter.scheme_uri,
        value_uri: filter.value_uri,
      },
      take: 50,
      skip: undefined,
    });
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw if invalid amount or offset provided', async () => {
    await expect(service.find({ amount: 0 })).rejects.toThrow(
      'Amount must be between 1 and 50',
    );
    await expect(service.find({ amount: 51 })).rejects.toThrow(
      'Amount must be between 1 and 50',
    );
    await expect(service.find({ offset: 0 })).rejects.toThrow(
      'Offset must be a positive integer',
    );
  });
});
