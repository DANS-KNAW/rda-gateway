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
import { IngestMode } from './ingests.controller';

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
    customNamespace?: string,
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

        const fileNameWithoutExt =
          customNamespace || file.originalname.replace(/\.[^/.]+$/, '');
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

  /**
   * Processes a CSV file in row mode - each row becomes one vocabulary entry.
   *
   * @param file - The uploaded CSV file
   * @param excludedColumns - Columns to exclude from processing
   * @param valueColumn - Column name to use as value_scheme
   * @param valueUriColumn - Optional column name to use as value_uri
   * @param customSubjectScheme - Optional fixed value for subject_scheme
   * @param customSchemeUri - Optional fixed value for scheme_uri
   * @param customNamespace - Optional namespace override (default: derived from filename)
   * @param descriptionColumn - Optional column name to use as description in additional_metadata
   * @returns IngestResult with success/failure counts
   */
  async processCSVFileRowMode(
    file: Express.Multer.File,
    excludedColumns: string[],
    valueColumn: string,
    valueUriColumn?: string,
    customSubjectScheme?: string,
    customSchemeUri?: string,
    customNamespace?: string,
    descriptionColumn?: string,
  ): Promise<IngestResult> {
    try {
      // Parse CSV file
      const records = parse<CSVRecord>(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
      });

      if (!records || records.length === 0) {
        throw new BadRequestException('CSV file is empty or invalid');
      }

      this.logger.log(
        `Parsed ${records.length} records from ${file.originalname} (row mode)`,
      );

      const firstRecord = records[0];
      const csvHeaders = Object.keys(firstRecord);

      // Validate valueColumn exists
      if (!csvHeaders.includes(valueColumn)) {
        throw new BadRequestException(
          `valueColumn "${valueColumn}" not found in CSV headers: ${csvHeaders.join(', ')}`,
        );
      }

      // Validate valueUriColumn exists if provided
      if (valueUriColumn && !csvHeaders.includes(valueUriColumn)) {
        throw new BadRequestException(
          `valueUriColumn "${valueUriColumn}" not found in CSV headers: ${csvHeaders.join(', ')}`,
        );
      }

      // Validate descriptionColumn exists if provided
      if (descriptionColumn && !csvHeaders.includes(descriptionColumn)) {
        throw new BadRequestException(
          `descriptionColumn "${descriptionColumn}" not found in CSV headers: ${csvHeaders.join(', ')}`,
        );
      }

      // Get columns for metadata (excluding valueColumn, valueUriColumn, descriptionColumn, and excludedColumns)
      const metadataColumns = csvHeaders.filter(
        (col) =>
          col !== valueColumn &&
          col !== valueUriColumn &&
          col !== descriptionColumn &&
          col &&
          col.trim() !== '' &&
          !excludedColumns.includes(col.trim()),
      );

      this.logger.log(
        `Row mode: using "${valueColumn}" as value, ${metadataColumns.length} columns as metadata`,
      );

      const namespace =
        customNamespace || file.originalname.replace(/\.[^/.]+$/, '');
      const subject_scheme = customSubjectScheme || namespace;
      const scheme_uri =
        customSchemeUri ||
        `https://${namespace}/vocabulary/${encodeURIComponent(namespace)}`;

      const results: Vocabulary[] = [];
      const errors: ParseError[] = [];

      // Process each row
      for (const record of records) {
        const value = record[valueColumn];

        // Skip rows with empty value
        if (value === null || value === undefined || value === '') {
          continue;
        }

        // Get value_uri from column or generate it
        let value_uri: string;
        if (valueUriColumn && record[valueUriColumn]) {
          value_uri = String(record[valueUriColumn]);
        } else {
          value_uri = `${scheme_uri}/${encodeURIComponent(String(value))}`;
        }

        try {
          // Build metadata from other columns
          const metadata: Record<string, unknown> = {};
          for (const col of metadataColumns) {
            if (record[col] !== null && record[col] !== undefined) {
              metadata[col] = record[col];
            }
          }

          // Add description from descriptionColumn if specified
          if (descriptionColumn && record[descriptionColumn]) {
            metadata.description = String(record[descriptionColumn]);
          }

          const createDto: CreateVocabularyDto = {
            subject_scheme,
            scheme_uri,
            value_scheme: String(value),
            value_uri,
            namespace,
            additional_metadata: metadata,
          };

          const vocabulary = await this.vocabulariesService.create(createDto);
          results.push(vocabulary);

          this.logger.debug(`Created vocabulary entry: ${value}`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to create vocabulary for row with value "${value}": ${errorMessage}`,
          );
          errors.push({
            record: { value: String(value) },
            error: errorMessage,
          });
        }
      }

      this.logger.log(
        `Row mode: processed ${results.length} vocabulary items successfully, ${errors.length} failed`,
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
      this.logger.error(
        `Error processing CSV file (row mode): ${errorMessage}`,
      );
      throw error;
    }
  }

  selectProcessingStrategy(
    file: Express.Multer.File,
  ):
    | ((
        file: Express.Multer.File,
        excludedColumns: string[],
        customNamespace?: string,
      ) => Promise<IngestResult>)
    | undefined {
    try {
      switch (file.mimetype) {
        case 'text/csv':
          this.logger.log(`Selected CSV processing for ${file.originalname}`);
          return this.processCSVFile.bind(this) as (
            file: Express.Multer.File,
            excludedColumns: string[],
            customNamespace?: string,
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
    mode: IngestMode = 'column',
    valueColumn?: string,
    valueUriColumn?: string,
    subjectScheme?: string,
    schemeUri?: string,
    customNamespace?: string,
    descriptionColumn?: string,
  ) {
    this.logger.log(`Ingesting ${files.length} files in ${mode} mode...`);

    const results: IngestResult[] = [];

    for (const file of files) {
      // For row mode, use the row processing method directly
      if (mode === 'row') {
        try {
          const result = await this.processCSVFileRowMode(
            file,
            excludedColumns,
            valueColumn!,
            valueUriColumn,
            subjectScheme,
            schemeUri,
            customNamespace,
            descriptionColumn,
          );
          results.push(result);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to process file ${file.originalname} (row mode): ${errorMessage}`,
          );
          results.push({
            filename: file.originalname,
            success: 0,
            failed: 0,
            error: errorMessage,
          });
        }
        continue;
      }

      // Column mode: use strategy pattern
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
        const result = await strategy(file, excludedColumns, customNamespace);
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
