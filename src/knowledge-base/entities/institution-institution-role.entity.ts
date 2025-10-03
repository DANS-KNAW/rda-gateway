import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class InstitutionInstitutionRole {
  @PrimaryColumn()
  UUID_Institution: string;

  @Column()
  Institution: string;

  @PrimaryColumn()
  InstitutionRoleID: string;

  @Column()
  InstitutionalRole: string;
}
