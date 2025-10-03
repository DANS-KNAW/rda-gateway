import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GORCAttribute {
  @PrimaryColumn()
  uuid_attribute: string;

  @Column()
  attribute: string;

  @Column()
  description: string;
}
