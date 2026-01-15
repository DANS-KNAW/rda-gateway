import { Test, TestingModule } from '@nestjs/testing';
import { OrcidService } from './orcid.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

describe('OrcidService', () => {
  let service: OrcidService;
  let loggerSpy: jest.SpyInstance;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeAll(() => {
    loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrcidService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<OrcidService>(OrcidService);
    service.clearCache();
    mockHttpService.get.mockReset();
    loggerSpy.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isValidOrcid', () => {
    it('should return true for valid ORCID with numeric checksum', () => {
      expect(service.isValidOrcid('0000-0002-1825-0097')).toBe(true);
      expect(service.isValidOrcid('0000-0001-5109-3700')).toBe(true);
    });

    it('should return true for valid ORCID with X checksum', () => {
      expect(service.isValidOrcid('0000-0002-1694-233X')).toBe(true);
    });

    it('should return false for invalid ORCID formats', () => {
      expect(service.isValidOrcid('invalid')).toBe(false);
      expect(service.isValidOrcid('0000-0000-0000')).toBe(false);
      expect(service.isValidOrcid('0000-0000-0000-000')).toBe(false);
      expect(service.isValidOrcid('john@example.com')).toBe(false);
      expect(service.isValidOrcid('')).toBe(false);
      expect(service.isValidOrcid('0000-0002-1825-009A')).toBe(false);
    });

    it('should return false for ORCID URIs', () => {
      expect(service.isValidOrcid('https://orcid.org/0000-0002-1825-0097')).toBe(
        false,
      );
    });
  });

  describe('lookupName', () => {
    it('should resolve full name from ORCID API', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            name: {
              'given-names': { value: 'John' },
              'family-name': { value: 'Doe' },
            },
          },
        }),
      );

      const result = await service.lookupName('0000-0002-1825-0097');
      expect(result).toBe('John Doe');
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://pub.orcid.org/v3.0/0000-0002-1825-0097/person',
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        }),
      );
    });

    it('should handle only given name', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            name: {
              'given-names': { value: 'Madonna' },
            },
          },
        }),
      );

      const result = await service.lookupName('0000-0002-1825-0097');
      expect(result).toBe('Madonna');
    });

    it('should handle only family name', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            name: {
              'family-name': { value: 'Prince' },
            },
          },
        }),
      );

      const result = await service.lookupName('0000-0002-1825-0097');
      expect(result).toBe('Prince');
    });

    it('should return null for invalid ORCID format without calling API', async () => {
      const result = await service.lookupName('invalid');
      expect(result).toBeNull();
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should return null when ORCID has no public name', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            name: null,
          },
        }),
      );

      const result = await service.lookupName('0000-0002-1825-0097');
      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network Error')),
      );

      const result = await service.lookupName('0000-0002-1825-0097');
      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should cache successful results', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            name: {
              'given-names': { value: 'Jane' },
              'family-name': { value: 'Smith' },
            },
          },
        }),
      );

      // First call
      const result1 = await service.lookupName('0000-0002-1825-0097');
      // Second call - should use cache
      const result2 = await service.lookupName('0000-0002-1825-0097');

      expect(result1).toBe('Jane Smith');
      expect(result2).toBe('Jane Smith');
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    });

    it('should cache null results to avoid repeated failed lookups', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: { name: null },
        }),
      );

      await service.lookupName('0000-0002-1825-0097');
      await service.lookupName('0000-0002-1825-0097');

      // Should only call API once, second call uses cached null
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    });

    it('should use different cache entries for different ORCIDs', async () => {
      mockHttpService.get
        .mockReturnValueOnce(
          of({
            data: {
              name: {
                'given-names': { value: 'Alice' },
                'family-name': { value: 'Anderson' },
              },
            },
          }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              name: {
                'given-names': { value: 'Bob' },
                'family-name': { value: 'Brown' },
              },
            },
          }),
        );

      const result1 = await service.lookupName('0000-0002-1825-0097');
      const result2 = await service.lookupName('0000-0001-5109-3700');

      expect(result1).toBe('Alice Anderson');
      expect(result2).toBe('Bob Brown');
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached entries', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            name: {
              'given-names': { value: 'Test' },
              'family-name': { value: 'User' },
            },
          },
        }),
      );

      // Populate cache
      await service.lookupName('0000-0002-1825-0097');
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Should call API again after cache clear
      await service.lookupName('0000-0002-1825-0097');
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
    });
  });
});
