import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class IngestFilesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value as string[];
    return [];
  })
  excludedColumns?: string[] = [];

  @IsOptional()
  @IsIn(['column', 'row'])
  mode?: 'column' | 'row' = 'column';

  @IsOptional()
  @IsString()
  valueColumn?: string;

  @IsOptional()
  @IsString()
  valueUriColumn?: string;

  @IsOptional()
  @IsString()
  subjectScheme?: string;

  @IsOptional()
  @IsString()
  schemeUri?: string;

  @IsOptional()
  @IsString()
  namespace?: string;

  @IsOptional()
  @IsString()
  descriptionColumn?: string;
}
