import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Resource {
  @Column()
  uuid: string;

  @Column({ nullable: true })
  uuid_link: string;

  @Column()
  uuid_uri_type: string;

  @PrimaryColumn()
  uuid_rda: string;

  @Column()
  title: string;

  @Column()
  notes: string;

  @Column()
  uri: string;

  @Column({ nullable: true })
  uri2: string;

  @Column({ nullable: true })
  pid_lod_type: string;

  @Column({ nullable: true })
  pid_lod: string;

  @Column()
  dc_date: string;

  @Column()
  dc_description: string;

  @Column()
  dc_language: string;

  @Column()
  type: string;

  @Column()
  dc_type: string;

  @Column({ nullable: true })
  card_url: string;

  @Column()
  source: string;

  @Column({ nullable: true })
  fragment: string;
}
