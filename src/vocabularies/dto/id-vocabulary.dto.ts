import { PickType } from '@nestjs/swagger';
import { Vocabulary } from '../entities/vocabulary.entity';

export class IdVocabularyDto extends PickType(Vocabulary, [
  'subject_scheme',
  'scheme_uri',
  'value_scheme',
  'value_uri',
] as const) {}
