import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IngestsService } from './ingests.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesSanitizePipe } from './pipes/files-sanitize.pipe';

@ApiTags('Ingests')
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
      },
    },
  })
  ingest(
    @Body('excludedColumns') excludedColumns: string[] = [],
    @UploadedFiles(new FilesSanitizePipe())
    files: Express.Multer.File[],
  ) {
    return this.ingestsService.ingestVocabularies(files, excludedColumns);
  }
}
