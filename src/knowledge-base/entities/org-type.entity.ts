import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OrgType {
  @PrimaryColumn()
  rda_uuid: string;

  @Column()
  internal_identifier: string;

  @Column()
  organisation_type_id: string;

  @Column()
  organisation_type: string;

  @Column()
  link_text: string;

  @Column()
  description: string;
}
