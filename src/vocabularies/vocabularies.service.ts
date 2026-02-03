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

// Interface for dedicated table query results
interface DedicatedTableRow {
  id: string;
  label: string;
  description?: string;
  url?: string;
  subject_scheme?: string;
}

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
   * Mapping of namespaces to their dedicated tables and field names.
   */
  private readonly dedicatedTableMap: Record<
    string,
    {
      table: string;
      idField: string;
      labelField: string;
      descField?: string;
      urlField?: string;
      subjectSchemeField?: string;
    }
  > = {
    rda_working_groups: {
      table: 'working_group',
      idField: 'uuid_working_group',
      labelField: 'title',
      descField: 'description',
      urlField: 'url',
    },
    rda_interest_groups: {
      table: 'interest_group',
      idField: 'uuid_interestGroup',
      labelField: 'title',
      descField: 'description',
      urlField: 'url',
    },
    disciplines: {
      table: 'discipline',
      idField: 'internal_identifier',
      labelField: 'list_item',
      descField: 'description',
      urlField: 'url',
    },
    gorc_elements: {
      table: 'gorc_element',
      idField: 'uuid_element',
      labelField: 'element',
      descField: 'description',
    },
    gorc_attributes: {
      table: 'gorc_atribute', // Note: typo in actual table name
      idField: 'uuid_attribute',
      labelField: 'attribute',
      descField: 'description',
    },
    rda_pathways: {
      table: 'pathway',
      idField: 'uuid_pathway',
      labelField: 'pathway',
      descField: 'description',
    },
    rda_keywords: {
      table: 'keyword',
      idField: 'uuid_keyword',
      labelField: 'keyword',
      subjectSchemeField: 'subject_scheme',
    },
    rda_resource_types: {
      table: 'uri_type',
      idField: 'uuid_uri_type',
      labelField: 'uri_type',
      descField: 'description',
    },
  };

  /**
   * Retrieves a list of vocabularies based on the provided filter criteria.
   * Routes to dedicated tables for specific namespaces, falls back to vocabulary table otherwise.
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

    // Check if namespace maps to a dedicated table
    if (vocab.namespace && this.dedicatedTableMap[vocab.namespace]) {
      return this.findFromDedicatedTable(vocab.namespace, {
        amount: amount || 500, // Higher limit for dedicated tables (finite lists)
        offset,
        valueScheme: vocab.value_scheme,
      });
    }

    // Use QueryBuilder to enable LIKE search on value_scheme (substring matching)
    const qb = this.vocabularyRepository.createQueryBuilder('v');

    // Add exact match filters for other fields
    if (vocab.namespace)
      qb.andWhere('v.namespace = :namespace', { namespace: vocab.namespace });
    if (vocab.subject_scheme)
      qb.andWhere('v.subject_scheme = :subject_scheme', {
        subject_scheme: vocab.subject_scheme,
      });
    if (vocab.scheme_uri)
      qb.andWhere('v.scheme_uri = :scheme_uri', {
        scheme_uri: vocab.scheme_uri,
      });
    if (vocab.value_uri)
      qb.andWhere('v.value_uri = :value_uri', { value_uri: vocab.value_uri });

    // Use LIKE for value_scheme to enable substring search
    if (vocab.value_scheme) {
      qb.andWhere('LOWER(v.value_scheme) LIKE LOWER(:value_scheme)', {
        value_scheme: `%${vocab.value_scheme}%`,
      });
    }

    if (deleted) {
      qb.withDeleted();
    }

    const results = await qb
      .take(amount || 50)
      .skip(offset)
      .getMany();

    if (results.length < 1) {
      throw new NotFoundException('No vocabularies found');
    }

    return results;
  }

  /**
   * Query a dedicated table and return results in Vocabulary format.
   */
  private async findFromDedicatedTable(
    namespace: string,
    options: { amount?: number; offset?: number; valueScheme?: string },
  ): Promise<Vocabulary[]> {
    const mapping = this.dedicatedTableMap[namespace];
    if (!mapping) {
      throw new BadRequestException(`Unknown namespace: ${namespace}`);
    }

    const {
      table,
      idField,
      labelField,
      descField,
      urlField,
      subjectSchemeField,
    } = mapping;
    const { amount = 500, offset = 0, valueScheme } = options;

    // Build query with optional search filter
    let query = `SELECT "${idField}" as id, "${labelField}" as label`;
    if (descField) query += `, "${descField}" as description`;
    if (urlField) query += `, "${urlField}" as url`;
    if (subjectSchemeField)
      query += `, "${subjectSchemeField}" as subject_scheme`;
    query += ` FROM "${table}"`;

    const params: string[] = [];
    if (valueScheme) {
      // Search on both label and description fields (if description exists)
      if (descField) {
        query += ` WHERE LOWER("${labelField}") LIKE LOWER($1) OR LOWER("${descField}") LIKE LOWER($1)`;
      } else {
        query += ` WHERE LOWER("${labelField}") LIKE LOWER($1)`;
      }
      params.push(`%${valueScheme}%`);
    }

    query += ` ORDER BY "${labelField}" ASC`;
    query += ` LIMIT ${amount} OFFSET ${offset}`;

    const results = await this.vocabularyRepository.manager.query<
      DedicatedTableRow[]
    >(query, params);

    if (!Array.isArray(results) || results.length < 1) {
      throw new NotFoundException('No vocabularies found');
    }

    // Transform to Vocabulary format (dedicated tables don't have timestamp fields)
    return results.map((row) => ({
      subject_scheme: row.subject_scheme || namespace,
      scheme_uri: namespace,
      value_scheme: row.label,
      value_uri: row.id,
      namespace: namespace,
      additional_metadata: {
        description: row.description || undefined,
        url: row.url || undefined,
      },
      deleted_at: null,
      updated_at: new Date(),
      created_at: new Date(),
    })) as Vocabulary[];
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
