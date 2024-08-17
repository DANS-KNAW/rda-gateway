import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IndividualGroup {
  @PrimaryColumn()
  uuid_individual: string;

  @Column()
  individual: string;

  @Column()
  member_type: string;

  @PrimaryColumn()
  uuid_group: string;

  @Column()
  group_type: string;

  @Column()
  group_title: string;
}
