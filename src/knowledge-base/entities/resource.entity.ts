import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Resource {
  @PrimaryColumn()
  uuid_rda: string;

  @Column()
  uuid: string;

  @Column()
  uuid_link: string;

  @Column()
  title: string;

  @Column()
  alternateTitle: string;

  @Column()
  uri: string;

  @Column()
  backupUri: string;

  @Column()
  uri2: string;

  @Column()
  backupUri2: string;

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
  resource_source: string;

  @Column()
  fragment: string;

  @Column()
  uuid_uri_type: string;

  @Column()
  notes: string;

  @Column()
  last_update: string;

  @Column()
  pathway: string;

  @Column()
  pathway_uuid: string;

  @Column()
  group_name: string;

  @Column()
  group_uuid: string;

  @Column()
  changed: string;
}
