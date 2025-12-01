import { PickType } from '@nestjs/swagger';
import { Vocabulary } from '../entities/vocabulary.entity';

export class CreateVocabularyDto extends PickType(Vocabulary, [
  'subject_scheme',
  'scheme_uri',
  'value_scheme',
  'value_uri',
  'namespace',
  'additional_metadata',
] as const) {}
