import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebsiteUserRoles {
  @PrimaryColumn()
  id: string;

  @Column()
  user_uuid: number;

  @Column()
  group_uuid: number;

  @Column()
  is_member: string;

  @Column()
  cochair: string;

  @Column()
  coordinator: string;

  @Column()
  secretariat_liason: string;

  @Column()
  tab_liason: string;
}
