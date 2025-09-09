import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Vocabulary {
  /**
   * @TODO Should confirm if we want a composite primary key instead.
   */
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  type: string;

  @Column()
  subject_scheme: string;

  @Column()
  scheme_uri: string;

  @Column()
  value_uri: string;

  @Column({ type: 'jsonb', nullable: true })
  additional_metadata: Record<string, any>;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
