import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OrgType {
  @Column()
  internal_identifier: string;

  @PrimaryColumn()
  rda_uuid: string;

  @Column()
  organisation_type_id: string;

  @Column()
  organisation_type: string;

  @Column()
  link_text: string;

  @Column()
  description: string;
}
