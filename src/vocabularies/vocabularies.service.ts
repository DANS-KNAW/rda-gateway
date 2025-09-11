import { Injectable } from '@nestjs/common';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VocabulariesService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) {}

  create(createVocabularyDto: CreateVocabularyDto) {
    return (
      'This action adds a new vocabulary' + JSON.stringify(createVocabularyDto)
    );
  }

  findAll() {
    return `This action returns all vocabularies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vocabulary`;
  }

  update(id: number, updateVocabularyDto: UpdateVocabularyDto) {
    return (
      `This action updates a #${id} vocabulary` +
      JSON.stringify(updateVocabularyDto)
    );
  }

  remove(id: number) {
    return `This action removes a #${id} vocabulary`;
  }
}
