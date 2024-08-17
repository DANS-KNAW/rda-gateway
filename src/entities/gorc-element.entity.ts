import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GORCElement {
  @PrimaryColumn()
  uuid_element: string;

  @Column()
  element: string;

  @Column()
  description: string;
}
