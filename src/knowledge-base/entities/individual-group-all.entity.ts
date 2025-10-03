import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IndividualGroupAll {
  @PrimaryColumn()
  uuid_group: string;

  @Column()
  group: string;

  @Column()
  memberNode: string;

  @Column()
  memberNodeBackup: string;

  @PrimaryColumn()
  uuid_individual: string;

  @Column()
  individual: string;
}
