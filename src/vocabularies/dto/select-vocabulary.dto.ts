import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { Vocabulary } from '../entities/vocabulary.entity';
import { IsBoolean, IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectVocabularyDto extends PartialType(
  PickType(Vocabulary, [
    'subject_scheme',
    'scheme_uri',
    'value_scheme',
    'value_uri',
    'namespace',
  ] as const),
) {
  @ApiPropertyOptional({ description: 'Number of results to return (max 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(50)
  amount?: number;

  @ApiPropertyOptional({ description: 'Number of results to skip' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  offset?: number;

  @ApiPropertyOptional({ description: 'Include deleted entries' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  deleted?: boolean;
}
