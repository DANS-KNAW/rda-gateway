import {
  Injectable,
  Logger,
  NotImplementedException,
  BadRequestException,
} from '@nestjs/common';
import { VocabulariesService } from 'src/vocabularies/vocabularies.service';
import { parse } from 'csv-parse/sync';
import { CreateVocabularyDto } from 'src/vocabularies/dto/create-vocabulary.dto';
import { Vocabulary } from 'src/vocabularies/entities/vocabulary.entity';
import { IngestResult } from './types/ingest-result.interface';
import { CSVRecord } from './types/csv-record.type';
import { ParseError } from './types/parse-error.interface';

@Injectable()
export class IngestsService {
  private readonly logger = new Logger(IngestsService.name);

  constructor(private readonly vocabulariesService: VocabulariesService) {}

  validateDumpFile() {
    throw new NotImplementedException();
  }

  preprocessDumpFile() {
    throw new NotImplementedException();
  }

  private getUniqueColumnValues(
    records: CSVRecord[],
    columnName: string,
  ): string[] {
    const values = records
      .map((record) => record[columnName])
      .filter((value) => value !== null && value !== undefined && value !== '');

    return [...new Set(values)].map((v) => String(v));
  }

  /**
   * Processes a CSV file and creates vocabulary entries.
   *
   * @param file - The uploaded CSV file
   * @param schema - Mapping of CSV headers to vocabulary fields
   * @returns Array of created vocabulary entities
   */
  async processCSVFile(
    file: Express.Multer.File,
    excludedColumns: string[],
  ): Promise<IngestResult> {
    try {
      // Parse CSV file
      const records = parse<CSVRecord>(file.buffer, {
        columns: true, // Use first row as headers
        skip_empty_lines: true,
        trim: true,
        cast: true,
      });

      if (!records || records.length === 0) {
        throw new BadRequestException('CSV file is empty or invalid');
      }

      this.logger.log(
        `Parsed ${records.length} records from ${file.originalname}`,
      );

      const firstRecord = records[0];
      const csvHeaders = Object.keys(firstRecord);

      const columnsToProcess = csvHeaders.filter(
        (col) =>
          col && col.trim() !== '' && !excludedColumns.includes(col.trim()),
      );

      this.logger.log(
        `Processing ${columnsToProcess.length} columns as vocabularies`,
      );

      // Process each column as a separate vocabulary
      const results: Vocabulary[] = [];
      const errors: ParseError[] = [];

      for (const column of columnsToProcess) {
        this.logger.log(`Processing vocabulary: ${column}`);

        const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
        const scheme_uri = `https://${fileNameWithoutExt}/vocabulary/${encodeURIComponent(column)}`;
        const uniqueValues = this.getUniqueColumnValues(records, column);

        for (const value of uniqueValues) {
          try {
            const createDto: CreateVocabularyDto = {
              subject_scheme: column,
              scheme_uri: scheme_uri,
              value_scheme: value,
              value_uri: `${scheme_uri}/${encodeURIComponent(value)}`,
              namespace: fileNameWithoutExt,
              additional_metadata: {
                source_file: file.originalname,
                column_name: column,
              },
            };

            const vocabulary = await this.vocabulariesService.create(createDto);
            results.push(vocabulary);

            this.logger.debug(
              `Created vocabulary entry: ${column} -> ${value}`,
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
              `Failed to create vocabulary for ${column}:"${value}": ${errorMessage}`,
            );
            errors.push({
              record: { column, value },
              error: errorMessage,
            });
          }
        }
      }

      this.logger.log(
        `Processed ${results.length} vocabulary items successfully, ${errors.length} failed`,
      );

      return {
        filename: file.originalname,
        success: results.length,
        failed: errors.length,
        error: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing CSV file: ${errorMessage}`);
      throw error;
    }
  }

  selectProcessingStrategy(
    file: Express.Multer.File,
  ):
    | ((
        file: Express.Multer.File,
        excludedColumns: string[],
      ) => Promise<IngestResult>)
    | undefined {
    try {
      switch (file.mimetype) {
        case 'text/csv':
          this.logger.log(`Selected CSV processing for ${file.originalname}`);
          return this.processCSVFile.bind(this) as (
            file: Express.Multer.File,
            excludedColumns: string[],
          ) => Promise<IngestResult>;

        default:
          this.logger.warn(
            `No processing strategy for ${file.originalname}: ${file.mimetype}`,
          );
          return undefined;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error selecting processing strategy: ${errorMessage}`);
      return undefined;
    }
  }

  async ingestVocabularies(
    files: Express.Multer.File[],
    excludedColumns: string[] = [],
  ) {
    this.logger.log(`Ingesting ${files.length} files...`);

    const results: IngestResult[] = [];

    for (const file of files) {
      const strategy = this.selectProcessingStrategy(file);

      if (!strategy) {
        this.logger.warn(
          `Skipping file ${file.originalname} - no processing strategy`,
        );
        results.push({
          filename: file.originalname,
          success: 0,
          failed: 0,
          error: 'No processing strategy available',
        });
        continue;
      }

      try {
        const result = await strategy(file, excludedColumns);
        results.push({
          ...result,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Failed to process file ${file.originalname}: ${errorMessage}`,
        );
        results.push({
          filename: file.originalname,
          success: 0,
          failed: 0,
          error: errorMessage,
        });
      }
    }

    return {
      filesProcessed: files.length,
      results,
    };
  }
}
