import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface OrcidPersonResponse {
  name?: {
    'given-names'?: { value: string };
    'family-name'?: { value: string };
  };
}

interface CacheEntry {
  name: string | null;
  timestamp: number;
}

@Injectable()
export class OrcidService {
  private readonly logger = new Logger(OrcidService.name);
  private readonly ORCID_API_BASE = 'https://pub.orcid.org/v3.0';
  private readonly ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REQUEST_TIMEOUT_MS = 3000;
  private cache = new Map<string, CacheEntry>();

  constructor(private readonly httpService: HttpService) {}

  isValidOrcid(value: string): boolean {
    return this.ORCID_REGEX.test(value);
  }

  async lookupName(orcidId: string): Promise<string | null> {
    if (!this.isValidOrcid(orcidId)) {
      this.logger.debug(`Invalid ORCID format: ${orcidId}`);
      return null;
    }

    // Check cache first
    const cached = this.cache.get(orcidId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      this.logger.debug(`Cache hit for ORCID: ${orcidId}`);
      return cached.name;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<OrcidPersonResponse>(
          `${this.ORCID_API_BASE}/${orcidId}/person`,
          {
            headers: { Accept: 'application/json' },
            timeout: this.REQUEST_TIMEOUT_MS,
          },
        ),
      );

      const givenNames = response.data?.name?.['given-names']?.value || '';
      const familyName = response.data?.name?.['family-name']?.value || '';

      const fullName = [givenNames, familyName]
        .filter(Boolean)
        .join(' ')
        .trim();
      const result = fullName || null;

      // Cache the result (even null results to avoid repeated failures)
      this.cache.set(orcidId, { name: result, timestamp: Date.now() });

      if (result) {
        this.logger.log(`Resolved ORCID ${orcidId} to name: ${result}`);
      } else {
        this.logger.warn(`ORCID ${orcidId} has no public name`);
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to lookup ORCID ${orcidId}: ${errorMessage}`);
      // Cache failure with short TTL (1 minute) to allow retry
      this.cache.set(orcidId, {
        name: null,
        timestamp: Date.now() - (this.CACHE_TTL_MS - 60000),
      });
      return null;
    }
  }

  // For testing: clear the cache
  clearCache(): void {
    this.cache.clear();
  }
}
