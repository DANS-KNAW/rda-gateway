import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebsiteWorkingGroup {
  @PrimaryColumn()
  id: string;

  @Column()
  group_uuid: number;

  @Column()
  kb_uuid: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  primary_domain: string;

  @Column()
  url: string;

  @Column()
  status: string;

  @Column()
  sub_status: string;

  @Column()
  updated_at: string;
}
