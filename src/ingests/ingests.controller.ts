import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { IngestsService } from './ingests.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesSanitizePipe } from './pipes/files-sanitize.pipe';

@Controller('ingests')
export class IngestsController {
  constructor(private readonly ingestsService: IngestsService) {}

  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  ingest(
    @UploadedFiles(new FilesSanitizePipe())
    files: Express.Multer.File[],
  ) {
    this.ingestsService.ingestVocabularies();
  }
}
