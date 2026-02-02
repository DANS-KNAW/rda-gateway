import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { IngestsService } from './ingests.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesSanitizePipe } from './pipes/files-sanitize.pipe';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { IngestFilesDto } from './dto/ingest-files.dto';

export type IngestMode = 'column' | 'row';

@ApiTags('Ingests')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('ingests')
export class IngestsController {
  constructor(private readonly ingestsService: IngestsService) {}

  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Ingest vocabulary data from CSV files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'CSV files to ingest',
        },
        excludedColumns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Column names to exclude from ingestion',
        },
        mode: {
          type: 'string',
          enum: ['column', 'row'],
          default: 'column',
          description:
            'Ingestion mode: "column" extracts unique values per column, "row" creates one entry per row',
        },
        valueColumn: {
          type: 'string',
          description:
            'Required for row mode: column name to use as value_scheme',
        },
        valueUriColumn: {
          type: 'string',
          description:
            'Optional for row mode: column name to use as value_uri (if not provided, URI is generated)',
        },
        subjectScheme: {
          type: 'string',
          description:
            'Optional for row mode: fixed value for subject_scheme (if not provided, uses namespace)',
        },
        schemeUri: {
          type: 'string',
          description:
            'Optional for row mode: fixed value for scheme_uri (if not provided, URI is generated)',
        },
        namespace: {
          type: 'string',
          description:
            'Optional: override the auto-generated namespace (default: derived from filename)',
        },
        descriptionColumn: {
          type: 'string',
          description:
            'Optional for row mode: column name to use as description in additional_metadata',
        },
      },
    },
  })
  ingest(
    @Body() dto: IngestFilesDto,
    @UploadedFiles(new FilesSanitizePipe())
    files: Express.Multer.File[],
  ) {
    const {
      excludedColumns = [],
      mode = 'column',
      valueColumn,
      valueUriColumn,
      subjectScheme,
      schemeUri,
      namespace,
      descriptionColumn,
    } = dto;

    if (mode === 'row' && !valueColumn) {
      throw new BadRequestException('valueColumn is required for row mode');
    }

    return this.ingestsService.ingestVocabularies(
      files,
      excludedColumns,
      mode,
      valueColumn,
      valueUriColumn,
      subjectScheme,
      schemeUri,
      namespace,
      descriptionColumn,
    );
  }
}
