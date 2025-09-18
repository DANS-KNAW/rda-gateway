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

@Entity()
export class Vocabulary {
  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  subject_scheme: string;

  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  scheme_uri: string;

  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  value_scheme: string;

  @IsString()
  @IsNotEmpty()
  @PrimaryColumn()
  value_uri: string;

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
