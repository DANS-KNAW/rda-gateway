import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IndividualMember {
  @PrimaryColumn()
  uuid_individual: string;

  @Column()
  combined_name: string;

  @PrimaryColumn()
  uuid_institution: string;

  @Column()
  institution: string;
}
