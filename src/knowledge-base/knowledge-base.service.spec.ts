import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { OrcidService } from 'src/orcid/orcid.service';
import { DataSource } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import elasticsearchConfig from 'src/config/elasticsearch.config';
import { Annotation } from './types/annotation.interface';

// Mock nanoid since it's an ESM module
jest.mock('nanoid', () => ({
  customAlphabet: jest.fn(() => () => 'MOCKID123456'),
}));

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService;
  let loggerSpy: jest.SpyInstance;

  const mockOrcidService = {
    isValidOrcid: jest.fn(),
    lookupName: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    query: jest.fn(),
  };

  const mockElasticsearchService = {
    index: jest.fn(),
    indices: {
      existsAlias: jest.fn(),
    },
  };

  beforeAll(() => {
    loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        { provide: OrcidService, useValue: mockOrcidService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ElasticsearchService, useValue: mockElasticsearchService },
        {
          provide: elasticsearchConfig.KEY,
          useValue: { ELASTIC_ALIAS_NAME: 'test-alias' },
        },
      ],
    }).compile();

    service = module.get<KnowledgeBaseService>(KnowledgeBaseService);
    jest.clearAllMocks();
    loggerSpy.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAnnotation', () => {
    const validAnnotation: Annotation = {
      submitter: '0000-0002-1825-0097',
      title: 'Test Annotation',
      selectedText: 'This is the selected text',
      resource: 'https://example.com/article',
      language: { label: 'English', value: 'eng' },
      resource_type: { label: 'Article', value: 'article' },
      target: {
        source: 'https://example.com/article',
        selector: [],
      },
    };

    describe('ORCID validation', () => {
      it('should throw BadRequestException for invalid ORCID format', async () => {
        mockOrcidService.isValidOrcid.mockReturnValue(false);

        await expect(
          service.createAnnotation({
            ...validAnnotation,
            submitter: 'invalid-orcid',
          }),
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.createAnnotation({
            ...validAnnotation,
            submitter: 'invalid-orcid',
          }),
        ).rejects.toThrow(/Invalid ORCID format/);

        expect(mockOrcidService.isValidOrcid).toHaveBeenCalledWith(
          'invalid-orcid',
        );
        // lookupName should not be called if format is invalid
        expect(mockOrcidService.lookupName).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when ORCID name cannot be resolved', async () => {
        mockOrcidService.isValidOrcid.mockReturnValue(true);
        mockOrcidService.lookupName.mockResolvedValue(null);

        await expect(
          service.createAnnotation(validAnnotation),
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.createAnnotation(validAnnotation),
        ).rejects.toThrow(/Could not resolve name for ORCID/);

        expect(mockOrcidService.isValidOrcid).toHaveBeenCalledWith(
          '0000-0002-1825-0097',
        );
        expect(mockOrcidService.lookupName).toHaveBeenCalledWith(
          '0000-0002-1825-0097',
        );
      });

      it('should validate ORCID format with various invalid inputs', async () => {
        mockOrcidService.isValidOrcid.mockReturnValue(false);

        const invalidOrcids = [
          'john@example.com',
          '1234',
          '0000-0000-0000',
          'https://orcid.org/0000-0002-1825-0097',
        ];

        for (const orcid of invalidOrcids) {
          await expect(
            service.createAnnotation({
              ...validAnnotation,
              submitter: orcid,
            }),
          ).rejects.toThrow(BadRequestException);
        }
      });
    });
  });
});
