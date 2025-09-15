import { PartialType, PickType } from '@nestjs/mapped-types';
import { Vocabulary } from '../entities/vocabulary.entity';

export class SelectVocabularyDto extends PartialType(
  PickType(Vocabulary, ['subject_scheme', 'scheme_uri', 'value_uri'] as const),
) {}
