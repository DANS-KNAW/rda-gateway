import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceDiscipline {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  resource: string;

  @PrimaryColumn()
  uuid_disciplines: string;

  @Column()
  disciplines: string;
}
