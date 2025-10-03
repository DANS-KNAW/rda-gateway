import { Column, Entity } from 'typeorm';

@Entity()
export class UuidMapping {
  @Column()
  canonical_uuid: string;

  @Column()
  deprecated_uuid: string;
}
