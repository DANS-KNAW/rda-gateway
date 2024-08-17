import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Individual {
  @PrimaryColumn()
  uuid_individual: string;

  @Column()
  combined_name: string;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column()
  fullName: string;

  @Column()
  revision_id: string;

  @Column()
  title: string;

  @Column()
  privacy_ticked: string;

  @Column()
  short_bio: string;

  @Column()
  rda_page: string;

  @Column()
  linked_in: string;

  @Column()
  twitter: string;

  @Column()
  identifier_type: string;

  @Column()
  identifier: string;

  @Column()
  source: string;

  @Column()
  uuid_rda_country: string;

  @Column()
  country: string;

  @Column()
  check: string;
}
