import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Pathway {
  @PrimaryColumn()
  uuid_pathway: string;

  @Column()
  pathway: string;

  @Column()
  description: string;

  @Column()
  data_source: string;
}
