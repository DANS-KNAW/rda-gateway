import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { Repository } from 'typeorm';
import { ExceptionHandler } from '../common/decorators/exception-handler.decorator';
import { SelectVocabularyDto } from './dto/select-vocabulary.dto';

@Injectable()
export class VocabulariesService {
  private readonly logger = new Logger(VocabulariesService.name);

  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) {}

  /**
   * Creates a new vocabulary entry in the database.
   *
   * This method attempts to insert a new `Vocabulary` entity using the provided
   * `CreateVocabularyDto`. The operation is performed within a database transaction
   * to ensure atomicity. If the insertion fails or the inserted entity cannot be
   * retrieved, appropriate errors are logged and exceptions are thrown.
   *
   * @param createVocabularyDto - The DTO containing the vocabulary details to create.
   * @returns {Vocabulary} The created `Vocabulary` entity.
   * @throws {InternalServerErrorException} If the insertion fails.
   * @throws {NotFoundException} If the vocabulary cannot be found after insertion.
   */
  @ExceptionHandler
  async create(createVocabularyDto: CreateVocabularyDto): Promise<Vocabulary> {
    return await this.vocabularyRepository.manager.transaction(
      async (manager) => {
        const dto = this.vocabularyRepository.create(createVocabularyDto);
        const insertResult = await manager.insert(Vocabulary, dto);

        if (insertResult.identifiers.length !== 1) {
          this.logger.error(
            `Failed to insert vocabulary: ${JSON.stringify(dto)}`,
          );
          throw new InternalServerErrorException(
            'Failure inserting vocabulary',
          );
        }

        const vocabulary = await manager.findOne(Vocabulary, {
          where: {
            subject_scheme: dto.subject_scheme,
            scheme_uri: dto.scheme_uri,
            value_uri: dto.value_uri,
          },
        });

        if (!vocabulary) {
          this.logger.error(
            `Failed to find vocabulary after insertion: ${JSON.stringify(dto)}`,
          );
          throw new NotFoundException(
            'Vocabulary not found after insertion. Please try again.',
          );
        }

        return vocabulary;
      },
    );
  }

  @ExceptionHandler
  async find(filter: SelectVocabularyDto): Promise<Vocabulary[]> {
    const results = await this.vocabularyRepository.findBy({ ...filter });

    if (results.length < 1) {
      throw new NotFoundException('No vocabularies found');
    }

    return results;
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
