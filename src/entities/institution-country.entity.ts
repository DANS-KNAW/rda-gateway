import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class InstitutionCountry {
  @PrimaryColumn()
  uuid_institution: string;

  @Column()
  institution: string;

  @Column()
  uuid_country: string;

  @Column()
  country: string;
}
