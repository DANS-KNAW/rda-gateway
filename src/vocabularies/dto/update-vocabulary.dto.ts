import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/mapped-types';
import { CreateVocabularyDto } from './create-vocabulary.dto';

export class UpdateVocabularyDto extends IntersectionType(
  PartialType(
    OmitType(CreateVocabularyDto, [
      'subject_scheme',
      'scheme_uri',
      'value_uri',
    ] as const),
  ),
  PickType(CreateVocabularyDto, [
    'subject_scheme',
    'scheme_uri',
    'value_uri',
  ] as const),
) {}
