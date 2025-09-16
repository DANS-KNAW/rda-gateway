import { PartialType, PickType } from '@nestjs/mapped-types';
import { Vocabulary } from '../entities/vocabulary.entity';
import { IsBoolean, IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectVocabularyDto extends PartialType(
  PickType(Vocabulary, ['subject_scheme', 'scheme_uri', 'value_uri'] as const),
) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(50)
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  offset?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  deleted?: boolean;
}
