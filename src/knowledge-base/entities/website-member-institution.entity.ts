import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebsiteMemberInstitution {
  @PrimaryColumn()
  id: string;

  @Column()
  institute_uuid: string;

  @Column()
  kb_uuid: string;

  @Column()
  institution_title: string;

  @Column()
  english_name: string;

  @Column()
  country: string;

  @Column()
  organisation_type: string;

  @Column()
  institutional_role: string;

  @Column()
  updated_at: string;
}
