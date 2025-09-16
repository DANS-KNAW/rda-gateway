import { PickType } from '@nestjs/mapped-types';
import { Vocabulary } from '../entities/vocabulary.entity';

export class IdVocabularyDto extends PickType(Vocabulary, [
  'subject_scheme',
  'scheme_uri',
  'value_uri',
] as const) {}
