import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Relation {
  @PrimaryColumn()
  uuid_relation_type: string;

  @Column()
  uuid_relation: string;

  @Column()
  relation: string;

  @Column()
  relation_type: string;

  @Column()
  short_description: string;

  @Column()
  description: string;
}
