import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SubjectResource {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  resource: string;

  @PrimaryColumn()
  keyword: string;
}
