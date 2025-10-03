import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebsiteInstitution {
  @PrimaryColumn()
  id: string;

  @Column()
  institution: string;

  @Column()
  institution_ror_link: string;

  @Column()
  identifier_type: string;

  @Column()
  user_uuid: string;
}
