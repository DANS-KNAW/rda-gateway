import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VocabulariesService } from './vocabularies.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { SelectVocabularyDto } from './dto/select-vocabulary.dto';
import { IdVocabularyDto } from './dto/id-vocabulary.dto';

@ApiTags('Vocabularies')
@Controller('vocabularies')
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vocabulary entry' })
  create(@Body() createVocabularyDto: CreateVocabularyDto) {
    return this.vocabulariesService.create(createVocabularyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find vocabulary entries with optional filters' })
  find(@Query() selectVocabularyDto: SelectVocabularyDto) {
    return this.vocabulariesService.find(selectVocabularyDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a vocabulary entry' })
  update(@Body() updateVocabularyDto: UpdateVocabularyDto) {
    return this.vocabulariesService.update(updateVocabularyDto);
  }

  @Patch('/restore')
  @HttpCode(204)
  @ApiOperation({ summary: 'Restore an archived vocabulary entry' })
  @ApiNoContentResponse({ description: 'Vocabulary restored' })
  restore(@Query() identifiers: IdVocabularyDto) {
    return this.vocabulariesService.restore(identifiers);
  }

  @Delete('/archive')
  @HttpCode(204)
  @ApiOperation({ summary: 'Archive a vocabulary entry (soft delete)' })
  @ApiNoContentResponse({ description: 'Vocabulary archived' })
  archive(@Query() identifiers: IdVocabularyDto) {
    return this.vocabulariesService.archive(identifiers);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Permanently delete a vocabulary entry' })
  @ApiNoContentResponse({ description: 'Vocabulary deleted' })
  remove(@Query() identifiers: IdVocabularyDto) {
    return this.vocabulariesService.remove(identifiers);
  }
}
