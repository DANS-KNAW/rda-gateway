import { IsNotEmpty, IsString } from 'class-validator';

export class SchemaDetailsDto {
  @IsString()
  @IsNotEmpty()
  subject_scheme: string;

  @IsString()
  @IsNotEmpty()
  scheme_uri: string;

  @IsString()
  @IsNotEmpty()
  value_scheme: string;

  @IsString()
  @IsNotEmpty()
  value_uri: string;
}

// Change to use an actual property, not an index signature
export type IngestSchemaDto = Record<string, SchemaDetailsDto>;
