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

  @Column()
  backup_url: string;

  @Column()
  status: string;

  @Column()
  sub_status: string;

  @Column()
  last_update: string;
}
