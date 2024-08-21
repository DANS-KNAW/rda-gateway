import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  ingestData(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'text/tab-separated-values' }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.seedingService.ingestTsvFiles(files);
  }
}
