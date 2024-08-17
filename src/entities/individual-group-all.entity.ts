import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IndividualGroupAll {
  @PrimaryColumn()
  uuid_group: string;

  @Column()
  group: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  uuid_individual: string;

  @Column()
  individual: string;
}
