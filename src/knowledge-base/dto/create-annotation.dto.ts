import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Selector DTOs
export class TextQuoteSelectorDto {
  @ApiProperty({ enum: ['TextQuoteSelector'] })
  @IsIn(['TextQuoteSelector'])
  type: 'TextQuoteSelector';

  @ApiProperty({ description: 'The exact text that was selected' })
  @IsString()
  @IsNotEmpty()
  exact: string;

  @ApiPropertyOptional({ description: 'Text immediately before the selection' })
  @IsString()
  @IsOptional()
  prefix?: string;

  @ApiPropertyOptional({ description: 'Text immediately after the selection' })
  @IsString()
  @IsOptional()
  suffix?: string;
}

export class TextPositionSelectorDto {
  @ApiProperty({ enum: ['TextPositionSelector'] })
  @IsIn(['TextPositionSelector'])
  type: 'TextPositionSelector';

  @ApiProperty({
    description: 'Character offset from the start of the document',
  })
  @IsNumber()
  start: number;

  @ApiProperty({
    description: 'Character offset from the start of the document',
  })
  @IsNumber()
  end: number;
}

export class RangeSelectorDto {
  @ApiProperty({ enum: ['RangeSelector'] })
  @IsIn(['RangeSelector'])
  type: 'RangeSelector';

  @ApiProperty({
    description: 'XPath to the element containing the start of the selection',
  })
  @IsString()
  @IsNotEmpty()
  startContainer: string;

  @ApiProperty({ description: 'Character offset within the start container' })
  @IsNumber()
  startOffset: number;

  @ApiProperty({
    description: 'XPath to the element containing the end of the selection',
  })
  @IsString()
  @IsNotEmpty()
  endContainer: string;

  @ApiProperty({ description: 'Character offset within the end container' })
  @IsNumber()
  endOffset: number;
}

export class PageSelectorDto {
  @ApiProperty({ enum: ['PageSelector'] })
  @IsIn(['PageSelector'])
  type: 'PageSelector';

  @ApiProperty({ description: 'Zero-based page index' })
  @IsNumber()
  index: number;

  @ApiPropertyOptional({ description: 'Page label' })
  @IsString()
  @IsOptional()
  label?: string;
}

// Annotation Target DTO
export class AnnotationTargetDto {
  @ApiProperty({ description: 'The URL of the document being annotated' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description:
      'Multiple selectors for the same text region (fallback strategy)',
    type: 'array',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  selector: (
    | TextQuoteSelectorDto
    | TextPositionSelectorDto
    | RangeSelectorDto
    | PageSelectorDto
  )[];
}

// Vocabulary DTO
export class VocabDto {
  @ApiProperty({ description: 'Display label' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: 'Secondary search term' })
  @IsString()
  @IsOptional()
  secondarySearch?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Value/identifier' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

// Main Create Annotation DTO
export class CreateAnnotationDto {
  @ApiProperty({ description: 'The selected/highlighted text (fragment)' })
  @IsString()
  @IsNotEmpty()
  selectedText: string;

  @ApiProperty({
    description: 'Annotation target with selectors for anchoring',
    type: AnnotationTargetDto,
  })
  @ValidateNested()
  @Type(() => AnnotationTargetDto)
  target: AnnotationTargetDto;

  @ApiProperty({ description: 'Annotation title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Annotation description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Language', type: VocabDto })
  @ValidateNested()
  @Type(() => VocabDto)
  language: VocabDto;

  @ApiProperty({ description: 'Resource URL being annotated' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ description: 'Resource type', type: VocabDto })
  @ValidateNested()
  @Type(() => VocabDto)
  resource_type: VocabDto;

  @ApiPropertyOptional({ description: 'Keywords', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  keywords?: VocabDto[];

  @ApiPropertyOptional({ description: 'Pathways', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  pathways?: VocabDto[];

  @ApiPropertyOptional({ description: 'GORC Elements', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  gorc_elements?: VocabDto[];

  @ApiPropertyOptional({ description: 'GORC Attributes', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  gorc_attributes?: VocabDto[];

  @ApiPropertyOptional({ description: 'Interest Groups', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  interest_groups?: VocabDto[];

  @ApiPropertyOptional({ description: 'Working Groups', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  working_groups?: VocabDto[];

  @ApiPropertyOptional({ description: 'Disciplines', type: [VocabDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabDto)
  @IsOptional()
  disciplines?: VocabDto[];

  @ApiProperty({ description: 'Submitter identifier' })
  @IsString()
  @IsNotEmpty()
  submitter: string;
}
