import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Institution {
  @PrimaryColumn()
  uuid_institution: string;

  @Column()
  institution: string;

  @Column()
  english_name: string;

  @Column()
  parent_institution: string;
}
