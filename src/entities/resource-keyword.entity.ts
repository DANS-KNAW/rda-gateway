import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceKeyword {
  @PrimaryColumn()
  uuid_resource: string;

  @PrimaryColumn()
  uuid_keyword: string;
}
