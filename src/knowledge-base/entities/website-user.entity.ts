import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebsiteUser {
  @PrimaryColumn()
  id: string;

  @Column()
  user_uuid: string;

  @Column()
  kb_uuid: string;

  @Column()
  user_login: string;

  @Column()
  user_email: string;

  @Column()
  display_name: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  full_name: string;

  @Column()
  profile_modified: string;

  @Column()
  privacy_ticked: string;

  @Column()
  title: string;

  @Column()
  identifier_type: string;

  @Column()
  identifier: string;

  @Column()
  country: string;

  @Column()
  member_node: string;
}
