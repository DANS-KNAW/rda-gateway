import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Discipline {
  @PrimaryColumn()
  uuid: string;

  @Column()
  internal_identifier: string;

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
