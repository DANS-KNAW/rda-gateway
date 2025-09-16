import {
  BadRequestException,
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
   * `CreateVocabularyDto`.
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

  /**
   * Retrieves a list of vocabularies based on the provided filter criteria.
   *
   * @param filter - An object containing optional filtering options
   * @returns {Vocabulary[]} An array of `Vocabulary` entities matching the filter criteria.
   * @throws {NotFoundException} If no vocabularies are found matching the filter criteria.
   */
  @ExceptionHandler
  async find(filter: SelectVocabularyDto): Promise<Vocabulary[]> {
    const { amount, offset, ...vocab } = filter;

    if (
      amount !== undefined &&
      (typeof amount !== 'number' || amount < 1 || amount > 50)
    ) {
      throw new BadRequestException('Amount must be between 1 and 50');
    }

    if (offset !== undefined && (typeof offset !== 'number' || offset < 1)) {
      throw new BadRequestException('Offset must be a positive integer');
    }

    const results = await this.vocabularyRepository.find({
      where: { ...vocab },
      take: amount ? amount : 50,
      skip: offset,
    });

    if (results.length < 1) {
      throw new NotFoundException('No vocabularies found');
    }

    return results;
  }

  /**
   * Updates an existing vocabulary entry in the database.
   *
   * This method locates the vocabulary and updates its fields based on the
   * provided `UpdateVocabularyDto`.
   *
   * Throws an `InternalServerErrorException` if the update fails, or a
   * `NotFoundException` if the vocabulary cannot be found after the update.
   *
   * @param updateVocabularyDto - DTO containing the vocabulary identifiers and fields to update.
   * @returns The updated `Vocabulary` entity.
   * @throws {InternalServerErrorException} If the update operation fails.
   * @throws {NotFoundException} If the vocabulary cannot be found after the update.
   */
  @ExceptionHandler
  async update(updateVocabularyDto: UpdateVocabularyDto) {
    return await this.vocabularyRepository.manager.transaction(
      async (manager) => {
        const { subject_scheme, scheme_uri, value_uri, ...toUpdate } =
          updateVocabularyDto;

        // No need to handle Will throw if vocabulary does not exist.
        const existis = await this.find({
          subject_scheme,
          scheme_uri,
          value_uri,
          amount: 1,
        });

        const updated = await manager.update(
          Vocabulary,
          {
            subject_scheme,
            scheme_uri,
            value_uri,
          },
          toUpdate,
        );

        // Edge case handling but should not be triggered.
        if (updated.affected !== 1) {
          this.logger.error(
            `Failed to update vocabulary: ${JSON.stringify({ dto: updateVocabularyDto, original: existis })}`,
          );
          throw new InternalServerErrorException('Failure updating vocabulary');
        }

        // We make an additional fetch to refresh the entity.
        const vocabulary = await manager.findOne(Vocabulary, {
          where: { subject_scheme, scheme_uri, value_uri },
        });

        // Edge case handling but should also not be triggered.
        if (!vocabulary) {
          this.logger.error(
            `Failed to find vocabulary after update: ${JSON.stringify(
              updateVocabularyDto,
            )}`,
          );
          throw new NotFoundException(
            'Vocabulary not found after update. Please try again.',
          );
        }

        return vocabulary;
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} vocabulary`;
  }
}
