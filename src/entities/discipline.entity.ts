import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Discipline {
  @Column()
  internal_identifier: string;

  @PrimaryColumn()
  uuid: string;

  @Column()
  list_item: string;

  @Column()
  description: string;

  @Column()
  description_source: string;

  @Column()
  taxonomy_parent: string;

  @Column()
  taxonomy_terms: string;

  @Column()
  uuid_parent: string;

  @Column()
  url: string;
}
