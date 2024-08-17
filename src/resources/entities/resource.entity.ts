import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Resource {
  @Column()
  uuid: string;

  @Column()
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

  @Column()
  uri2: string;

  @Column()
  pid_lod_type: string;

  @Column()
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

  @Column()
  card_url: string;

  @Column()
  source: string;
}
