import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebsiteOutput {
  @PrimaryColumn()
  id: string;

  @Column()
  output_uuid: string;

  @Column()
  kb_uuid: string;

  @Column()
  title: string;

  @Column()
  rda_url: string;

  @Column()
  doi_uuid: string;

  @Column()
  dc_description: string;

  @Column()
  dc_language: string;

  @Column()
  type: string;

  @Column()
  ig_title: string;

  @Column()
  wg_title: string;

  @Column()
  summary_file_url: string;

  @Column()
  updated_at: string;

  @Column()
  output_type: string;

  @Column()
  output_status: string;

  @Column()
  review_period_start: string;

  @Column()
  review_period_end: string;

  @Column({ type: 'jsonb' })
  rda_authors: object;

  @Column({ type: 'jsonb' })
  non_rda_authors: object;

  @Column({ type: 'jsonb' })
  adopters: object;

  @Column({ type: 'jsonb' })
  rda_pathways: object;

  @Column({ type: 'jsonb' })
  group_technology_focus: object;

  @Column({ type: 'jsonb' })
  standards: object;

  @Column({ type: 'jsonb' })
  stakeholders: object;

  @Column()
  regions: string;

  @Column()
  primary_domain: string;

  @Column()
  primary_field_of_expertise: string;

  @Column()
  impact_statement: string;

  @Column()
  explanation: string;

  @Column()
  change: string;
}
