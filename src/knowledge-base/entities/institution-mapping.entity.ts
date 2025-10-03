import { Column, Entity } from 'typeorm';

@Entity()
export class InstitutionMapping {
  @Column()
  original: string;

  @Column()
  normalized: string;
}
