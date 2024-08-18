import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Relation {
  @Column()
  uuid_relation: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  uuid_relation_type: string;

  @Column()
  relation_type: string;

  @Column()
  short_description: string;

  @Column()
  description: string;

  @Column()
  last_update: string;
}
