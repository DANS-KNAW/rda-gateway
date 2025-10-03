import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class InstitutionRole {
  @PrimaryColumn()
  InstitutionRoleID: string;

  @Column()
  internal_identifier: string;

  @Column()
  InstitutionRole: string;

  @Column()
  RDA_taxonomy: string;

  @Column()
  Description: string;
}
