import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Keyword {
  @PrimaryColumn()
  uuid_keyword: string;

  @Column()
  keyword: string;
}
