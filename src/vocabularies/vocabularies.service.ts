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
import { IdVocabularyDto } from './dto/id-vocabulary.dto';

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
            value_scheme: dto.value_scheme,
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
    const { amount, offset, deleted, ...vocab } = filter;

    if (
      amount !== undefined &&
      (typeof amount !== 'number' || amount < 1 || amount > 50)
    ) {
      throw new BadRequestException('Amount must be between 1 and 50');
    }

    if (offset !== undefined && (typeof offset !== 'number' || offset < 1)) {
      throw new BadRequestException('Offset must be a positive integer');
    }

    if (deleted && typeof deleted !== 'boolean') {
      throw new BadRequestException('Deleted must be a boolean');
    }

    const results = await this.vocabularyRepository.find({
      where: { ...vocab },
      take: amount ? amount : 50,
      skip: offset,
      withDeleted: deleted,
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
        const {
          subject_scheme,
          scheme_uri,
          value_scheme,
          value_uri,
          ...toUpdate
        } = updateVocabularyDto;

        // No need to handle Will throw if vocabulary does not exist.
        const existis = await this.find({
          subject_scheme,
          scheme_uri,
          value_scheme,
          value_uri,
          amount: 1,
        });

        const updated = await manager.update(
          Vocabulary,
          {
            subject_scheme,
            scheme_uri,
            value_scheme,
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
          where: { subject_scheme, scheme_uri, value_scheme, value_uri },
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

  /**
   * Archives a vocabulary entry by marking it as deleted (soft delete).
   *
   * @param identifiers - An object containing the identifiers of the vocabulary.
   * @throws {BadRequestException} If the vocabulary is already archived.
   * @throws {InternalServerErrorException} If the archiving operation fails.
   */
  @ExceptionHandler
  async archive(identifiers: IdVocabularyDto): Promise<void> {
    const { subject_scheme, scheme_uri, value_scheme, value_uri } = identifiers;

    const vocabulary = await this.find({
      subject_scheme,
      scheme_uri,
      value_scheme,
      value_uri,
      amount: 1,
      deleted: true,
    });

    if (vocabulary[0].deleted_at !== null) {
      throw new BadRequestException('Vocabulary is already archived');
    }

    const result = await this.vocabularyRepository.softDelete({
      subject_scheme,
      scheme_uri,
      value_scheme,
      value_uri,
    });

    if (result.affected !== 1) {
      this.logger.error(
        `Failed to archive vocabulary: ${JSON.stringify(identifiers)}`,
      );
      throw new InternalServerErrorException('Failure archiving vocabulary');
    }

    return;
  }

  /**
   * Restores a previously archived vocabulary entry based on the provided identifiers.
   *
   * @param identifiers - An object containing the identifiers of the vocabulary.
   * @throws {BadRequestException} If the vocabulary is not archived.
   * @throws {InternalServerErrorException} If the restore operation fails.
   */
  @ExceptionHandler
  async restore(identifiers: IdVocabularyDto): Promise<void> {
    const { subject_scheme, scheme_uri, value_scheme, value_uri } = identifiers;

    const vocabulary = await this.find({
      subject_scheme,
      scheme_uri,
      value_scheme,
      value_uri,
      amount: 1,
      deleted: true,
    });

    if (vocabulary[0].deleted_at === null) {
      throw new BadRequestException('Vocabulary is not archived');
    }

    const result = await this.vocabularyRepository.restore({
      subject_scheme,
      scheme_uri,
      value_scheme,
      value_uri,
    });

    if (result.affected !== 1) {
      this.logger.error(
        `Failed to restore vocabulary: ${JSON.stringify(identifiers)}`,
      );
      throw new InternalServerErrorException('Failure restoring vocabulary');
    }

    return;
  }

  /**
   * Permanently removes a vocabulary entry identified by the given identifiers.
   *
   * The vocabulary must be archived (i.e., `deleted_at` is not null) before it can be permanently deleted.
   *
   * @param identifiers - An object containing the identifiers of the vocabulary.
   * @throws {BadRequestException} If the vocabulary is not archived.
   * @throws {InternalServerErrorException} If the deletion fails.
   */
  @ExceptionHandler
  async remove(identifiers: IdVocabularyDto): Promise<void> {
    const { subject_scheme, scheme_uri, value_scheme, value_uri } = identifiers;

    const vocabulary = await this.find({
      subject_scheme,
      scheme_uri,
      value_scheme,
      value_uri,
      amount: 1,
      deleted: true,
    });

    if (vocabulary[0].deleted_at === null) {
      throw new BadRequestException(
        'Vocabulary must be archived before permanent deletion',
      );
    }

    const result = await this.vocabularyRepository.delete({
      subject_scheme,
      scheme_uri,
      value_scheme,
      value_uri,
    });

    if (result.affected !== 1) {
      this.logger.error(
        `Failed to delete vocabulary: ${JSON.stringify(identifiers)}`,
      );
      throw new InternalServerErrorException('Failure deleting vocabulary');
    }

    return;
  }
}
