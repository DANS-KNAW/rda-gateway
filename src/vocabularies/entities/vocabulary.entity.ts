import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Vocabulary {
  @ApiProperty({ description: 'Subject scheme identifier' })
  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  subject_scheme: string;

  @ApiProperty({ description: 'URI of the scheme' })
  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  scheme_uri: string;

  @ApiProperty({ description: 'Value scheme identifier' })
  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  value_scheme: string;

  @ApiProperty({ description: 'URI of the value' })
  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  value_uri: string;

  @ApiProperty({ description: 'Namespace identifier' })
  @IsString()
  @IsNotEmpty()
  @Column()
  namespace: string;

  @ApiPropertyOptional({ description: 'Additional metadata as JSON' })
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @Column({ type: 'jsonb', nullable: true })
  additional_metadata: Record<string, any>;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
