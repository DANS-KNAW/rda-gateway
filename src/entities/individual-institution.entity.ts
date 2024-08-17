import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IndividualInstitution {
  @Column()
  internal_identifier: string;

  @PrimaryColumn()
  uuid_institution: string;

  @Column()
  organisation: string;

  @PrimaryColumn()
  uuid_rda_member: string;

  @Column()
  member: string;
}
