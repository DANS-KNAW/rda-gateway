import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export type vocab = {
  id: string;
  label: string;
  value: string;
  description?: string;
  url?: string;
};

// export class Annotation {
//   @IsString()
//   page_url: string;

//   @IsString()
//   annotation: string;

//   @IsString()
//   uritype: string;

//   citation: {
//     title: string;
//     description?: string;
//     notes?: string;
//     submitter?: string;
//     language: {
//       id: string;
//       label: string;
//       value: string;
//     };
//     created_at: string;
//     resource?: string;
//   };
//   vocabularies: {
//     pathways?: vocab[];
//     gorc_attributes?: vocab[];
//     gorc_elements?: vocab[];
//     working_groups?: vocab[];
//     interest_groups?: vocab[];
//     domains?: vocab[];
//   };
// }

class Language {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  value: string;
}

class Citation {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  submitter?: string;

  @ValidateNested()
  @Type(() => Language)
  language: Language;

  @IsString()
  created_at: string;

  @IsOptional()
  @IsString()
  resource?: string;
}

class Vocab {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  url?: string;
}

class Vocabularies {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Vocab)
  pathways?: Vocab[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Vocab)
  gorc_attributes?: Vocab[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Vocab)
  gorc_elements?: Vocab[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Vocab)
  working_groups?: Vocab[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Vocab)
  interest_groups?: Vocab[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Vocab)
  domains?: Vocab[];
}

export class Annotation {
  @IsString()
  page_url: string;

  @IsOptional()
  @IsString()
  annotation: string;

  @IsString()
  uritype: string;

  @ValidateNested()
  @Type(() => Citation)
  citation: Citation;

  @ValidateNested()
  @Type(() => Vocabularies)
  vocabularies: Vocabularies;
}
