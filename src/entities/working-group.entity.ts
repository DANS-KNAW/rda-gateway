import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WorkingGroup {
  @PrimaryColumn()
  uuid_working_group: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  uuid_domain: string;

  @Column()
  domains: string;

  @Column()
  url: string;
}
