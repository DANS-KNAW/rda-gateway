import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class InstitutionOrganisationType {
  @PrimaryColumn()
  uuid_institution: string;

  @Column()
  institution: string;

  @PrimaryColumn()
  uuid_org_type: string;

  @Column()
  organisation_type: string;
}
