import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesService } from './vocabularies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SelectVocabularyDto } from './dto/select-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

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
    softDelete: jest.Mock;
    restore: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: {
      transaction: jest.Mock;
    };
  };

  const manager = {
    insert: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const repositoryMock: RepoMock = {
    create: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
    value_scheme: 'Test Value Scheme',
    namespace: 'test-namespace',
    additional_metadata: { key: 'value' },
    deleted_at: null,
    updated_at: new Date(),
    created_at: new Date(),
  };

  const createDto: CreateVocabularyDto = {
    scheme_uri: dummyVocabulary.scheme_uri,
    subject_scheme: dummyVocabulary.subject_scheme,
    value_uri: dummyVocabulary.value_uri,
    value_scheme: dummyVocabulary.value_scheme,
    namespace: dummyVocabulary.namespace,
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
    manager.update.mockReset();
    repositoryMock.find.mockReset();
    repositoryMock.softDelete.mockReset();
    repositoryMock.restore.mockReset();
    repositoryMock.delete.mockReset();
    repositoryMock.createQueryBuilder.mockClear();
    mockQueryBuilder.andWhere.mockClear();
    mockQueryBuilder.withDeleted.mockClear();
    mockQueryBuilder.take.mockClear();
    mockQueryBuilder.skip.mockClear();
    mockQueryBuilder.getMany.mockReset();

    loggerErrorSpy.mockClear();
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a vocabulary successfully', async () => {
      repositoryMock.create.mockReturnValue(createDto);

      manager.insert.mockResolvedValue({
        identifiers: [
          {
            subject_scheme: createDto.subject_scheme,
            scheme_uri: createDto.scheme_uri,
            value_uri: createDto.value_uri,
            value_scheme: createDto.value_scheme,
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
          value_scheme: createDto.value_scheme,
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
            value_scheme: createDto.value_scheme,
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
          value_scheme: createDto.value_scheme,
        },
      });
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('find', () => {
    it('should find all vocabularies (no filter)', async () => {
      const vocabularies = Array.from({ length: 51 }, (_, i) => ({
        ...dummyVocabulary,
        value_uri: `${dummyVocabulary.value_uri}${i}`,
      }));
      mockQueryBuilder.getMany.mockResolvedValue(vocabularies.slice(0, 50));

      const results = await service.find({});

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(results.length).toBe(50);
      expect(results).toEqual(vocabularies.slice(0, 50));
    });

    it('should find vocabularies with specific filters', async () => {
      const filter: SelectVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: undefined,
        value_scheme: undefined,
        amount: 10,
        offset: 5,
        deleted: false,
      };

      const vocabularies = Array.from({ length: 20 }, (_, i) => ({
        ...dummyVocabulary,
        value_uri: `${dummyVocabulary.value_uri}${i}`,
      }));
      mockQueryBuilder.getMany.mockResolvedValue(vocabularies.slice(5, 15));

      const results = await service.find(filter);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(results.length).toBe(10);
      expect(results).toEqual(vocabularies.slice(5, 15));
    });

    it('should find a specific vocabulary with exact filters', async () => {
      const filter: SelectVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);

      const results = await service.find(filter);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(results.length).toBe(1);
      expect(results).toEqual([dummyVocabulary]);
    });

    it('should throw if no vocabularies found', async () => {
      const filter: SelectVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.find(filter)).rejects.toThrow(
        new NotFoundException('No vocabularies found'),
      );

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
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

  describe('update', () => {
    it('should update a vocabulary successfully', async () => {
      const updateDto: UpdateVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
        additional_metadata: { key: 'newValue' },
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);
      manager.update.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1,
      });
      manager.findOne.mockResolvedValue({ ...dummyVocabulary, ...updateDto });

      const result = await service.update(updateDto);

      expect(manager.update).toHaveBeenCalledWith(
        Vocabulary,
        {
          subject_scheme: updateDto.subject_scheme,
          scheme_uri: updateDto.scheme_uri,
          value_uri: updateDto.value_uri,
          value_scheme: updateDto.value_scheme,
        },
        { additional_metadata: updateDto.additional_metadata },
      );
      expect(manager.findOne).toHaveBeenCalledWith(Vocabulary, {
        where: {
          subject_scheme: updateDto.subject_scheme,
          scheme_uri: updateDto.scheme_uri,
          value_uri: updateDto.value_uri,
          value_scheme: updateDto.value_scheme,
        },
      });
      expect(result).toEqual({ ...dummyVocabulary, ...updateDto });
    });

    it('should throw if update affects no rows', async () => {
      const updateDto: UpdateVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
        additional_metadata: { key: 'newValue' },
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);
      manager.update.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 0,
      });

      await expect(service.update(updateDto)).rejects.toThrow(
        new InternalServerErrorException('Failure updating vocabulary'),
      );

      expect(manager.update).toHaveBeenCalledWith(
        Vocabulary,
        {
          subject_scheme: updateDto.subject_scheme,
          scheme_uri: updateDto.scheme_uri,
          value_uri: updateDto.value_uri,
          value_scheme: updateDto.value_scheme,
        },
        { additional_metadata: updateDto.additional_metadata },
      );
      expect(manager.findOne).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw if vocabulary not found after update', async () => {
      const updateDto: UpdateVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
        additional_metadata: { key: 'newValue' },
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);
      manager.update.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1,
      });
      manager.findOne.mockResolvedValue(null);

      await expect(service.update(updateDto)).rejects.toThrow(
        new NotFoundException(
          'Vocabulary not found after update. Please try again.',
        ),
      );

      expect(manager.update).toHaveBeenCalledWith(
        Vocabulary,
        {
          subject_scheme: updateDto.subject_scheme,
          scheme_uri: updateDto.scheme_uri,
          value_uri: updateDto.value_uri,
          value_scheme: updateDto.value_scheme,
        },
        { additional_metadata: updateDto.additional_metadata },
      );
      expect(manager.findOne).toHaveBeenCalledWith(Vocabulary, {
        where: {
          subject_scheme: updateDto.subject_scheme,
          scheme_uri: updateDto.scheme_uri,
          value_uri: updateDto.value_uri,
          value_scheme: updateDto.value_scheme,
        },
      });
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw if vocabulary to update does not exist', async () => {
      const updateDto: UpdateVocabularyDto = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
        additional_metadata: { key: 'newValue' },
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);
      await expect(service.update(updateDto)).rejects.toThrow(
        new NotFoundException('No vocabularies found'),
      );

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(manager.update).not.toHaveBeenCalled();
      expect(manager.findOne).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should archive (soft delete) a vocabulary successfully', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);
      repositoryMock.softDelete.mockResolvedValue({ affected: 1 });

      await expect(service.archive(identifiers)).resolves.toBe(undefined);
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.softDelete).toHaveBeenCalledWith(identifiers);
    });

    it('should throw an error if vocabulary not found', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.archive(identifiers)).rejects.toThrow(
        new NotFoundException('No vocabularies found'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.softDelete).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if vocabulary is already archived', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([
        { ...dummyVocabulary, deleted_at: new Date().toISOString() },
      ]);
      await expect(service.archive(identifiers)).rejects.toThrow(
        new BadRequestException('Vocabulary is already archived'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.softDelete).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if soft delete fails', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);
      repositoryMock.softDelete.mockResolvedValue({ affected: 0 });
      await expect(service.archive(identifiers)).rejects.toThrow(
        new InternalServerErrorException('Failure archiving vocabulary'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.softDelete).toHaveBeenCalledWith(identifiers);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('restore', () => {
    it('should restore (soft-delete) a vocabulary successfully', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([
        { ...dummyVocabulary, deleted_at: new Date().toISOString() },
      ]);
      repositoryMock.restore.mockResolvedValue({ affected: 1 });

      const result = await service.restore(identifiers);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.restore).toHaveBeenCalledWith(identifiers);
      expect(result).toBeUndefined();
    });

    it('should throw an error if vocabulary not found', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.restore(identifiers)).rejects.toThrow(
        new NotFoundException('No vocabularies found'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.restore).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if vocabulary is not archived', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);

      await expect(service.restore(identifiers)).rejects.toThrow(
        new BadRequestException('Vocabulary is not archived'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.restore).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if restore fails', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([
        { ...dummyVocabulary, deleted_at: new Date().toISOString() },
      ]);
      repositoryMock.restore.mockResolvedValue({ affected: 0 });

      await expect(service.restore(identifiers)).rejects.toThrow(
        new InternalServerErrorException('Failure restoring vocabulary'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.restore).toHaveBeenCalledWith(identifiers);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should permanently remove a vocabulary successfully', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([
        { ...dummyVocabulary, deleted_at: new Date().toISOString() },
      ]);
      repositoryMock.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await service.remove(identifiers);

      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.delete).toHaveBeenCalledWith(identifiers);
      expect(result).toBeUndefined();
    });

    it('should throw an error if vocabulary not found', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.remove(identifiers)).rejects.toThrow(
        new NotFoundException('No vocabularies found'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.delete).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if vocabulary is not archived', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([dummyVocabulary]);
      await expect(service.remove(identifiers)).rejects.toThrow(
        new BadRequestException(
          'Vocabulary must be archived before permanent deletion',
        ),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.delete).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if delete fails', async () => {
      const identifiers = {
        subject_scheme: dummyVocabulary.subject_scheme,
        scheme_uri: dummyVocabulary.scheme_uri,
        value_uri: dummyVocabulary.value_uri,
        value_scheme: dummyVocabulary.value_scheme,
      };

      mockQueryBuilder.getMany.mockResolvedValue([
        { ...dummyVocabulary, deleted_at: new Date().toISOString() },
      ]);
      repositoryMock.delete = jest.fn().mockResolvedValue({ affected: 0 });

      await expect(service.remove(identifiers)).rejects.toThrow(
        new InternalServerErrorException('Failure deleting vocabulary'),
      );
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('v');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(repositoryMock.delete).toHaveBeenCalledWith(identifiers);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
