import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class InstitutionRole {
  @Column()
  internal_identifier: string;

  @PrimaryColumn()
  InstitutionRoleID: string;

  @Column()
  InstitutionRole: string;

  @Column()
  RDA_taxonomy: string;

  @Column()
  Description: string;
}
