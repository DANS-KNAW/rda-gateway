import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UriType {
  @PrimaryColumn()
  uuid_uri_type: string;

  @Column()
  uri_type: string;

  @Column()
  description: string;
}
