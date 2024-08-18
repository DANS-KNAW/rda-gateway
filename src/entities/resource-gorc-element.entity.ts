import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceGORCElement {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  resource: string;

  @PrimaryColumn()
  uuid_element: string;

  @Column()
  element: string;
}
