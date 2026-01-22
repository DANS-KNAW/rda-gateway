import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import coreConfig from './config/core.config';
import type { ConfigType } from '@nestjs/config';

// Partial interfaces for GitHub API response. Only the needed fields are included.
interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  digest: string;
}

interface GitHubRelease {
  tag_name: string;
  prerelease: boolean;
  published_at: string;
  assets: GitHubAsset[];
}

// Interface for annotator metadata query result
interface AnnotatorMetadataRow {
  version: string;
  chrome_zip_url: string;
  release_date: string;
  is_prerelease: boolean;
  file_size_bytes: number;
  sha256_digest: string | null;
  name: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly GITHUB_API_URL =
    'https://api.github.com/repos/DANS-KNAW/rda-annotator/releases';

  constructor(
    @Inject(coreConfig.KEY)
    private readonly config: ConfigType<typeof coreConfig>,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getLatestAnnotatorVersion() {
    try {
      this.logger.log('Fetching latest annotator version from GitHub...');

      const response = await firstValueFrom(
        this.httpService.get<GitHubRelease[]>(this.GITHUB_API_URL),
      );

      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to fetch releases from GitHub');
      }

      const releases = response.data;

      if (releases.length === 0) {
        throw new Error('No releases found in the GitHub repository');
      }

      const latestRelease = releases[0]; // We assume the first release is the latest!
      const version = latestRelease.tag_name;
      const chromeAsset = latestRelease.assets.find((asset) =>
        /rda-annotator-.*-chrome\.zip$/.test(asset.name),
      );

      if (!chromeAsset) {
        throw new Error(`No Chrome zip found for version ${version}`);
      }

      const existing = await this.dataSource.query<{ version: string }[]>(
        'SELECT version FROM annotator_metadata WHERE version = $1',
        [version],
      );

      if (Array.isArray(existing) && existing.length > 0) {
        this.logger.log(`Version ${version} already exists in database`);
        return;
      }

      await this.dataSource.query(
        `INSERT INTO annotator_metadata 
         (version, chrome_zip_url, release_date, is_prerelease, file_size_bytes, sha256_digest, name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          version,
          chromeAsset.browser_download_url,
          latestRelease.published_at,
          latestRelease.prerelease,
          chromeAsset.size,
          chromeAsset.digest?.replace('sha256:', '') || null,
          chromeAsset.name,
        ],
      );

      this.logger.log(`Successfully added version ${version} to database`);
    } catch (error) {
      this.logger.error('Error fetching latest annotator version', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getAnnotator(): Promise<AnnotatorMetadataRow> {
    try {
      const result = await this.dataSource.query<AnnotatorMetadataRow[]>(
        'SELECT * FROM annotator_metadata ORDER BY release_date DESC LIMIT 1',
      );

      if (!Array.isArray(result) || result.length === 0) {
        throw new NotFoundException('No annotator metadata found');
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(errorMessage);
      throw new InternalServerErrorException(
        'Error fetching annotator metadata',
      );
    }
  }

  getAnnotatorMinVersion(): { minVersion: string } {
    const minVersion = this.config.ANNOTATOR_MIN_VERSION;
    if (!minVersion) {
      throw new InternalServerErrorException(
        'Minimum annotator version is not configured',
      );
    }
    return { minVersion };
  }
}
