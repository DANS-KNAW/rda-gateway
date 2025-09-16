import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { SelectVocabularyDto } from './dto/select-vocabulary.dto';

@Controller('vocabularies')
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) {}

  @Post()
  create(@Body() createVocabularyDto: CreateVocabularyDto) {
    return this.vocabulariesService.create(createVocabularyDto);
  }

  @Get()
  find(@Query() selectVocabularyDto: SelectVocabularyDto) {
    return this.vocabulariesService.find(selectVocabularyDto);
  }

  @Patch()
  update(@Body() updateVocabularyDto: UpdateVocabularyDto) {
    return this.vocabulariesService.update(updateVocabularyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vocabulariesService.remove(+id);
  }
}
