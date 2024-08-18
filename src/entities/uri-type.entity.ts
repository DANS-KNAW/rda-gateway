import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class URIType {
  @PrimaryColumn()
  uuid_uri_type: string;

  @Column()
  uri_type: string;

  @Column()
  description: string;

  @Column()
  last_touch: string;
}
