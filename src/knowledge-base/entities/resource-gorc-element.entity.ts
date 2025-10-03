import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceGorcElement {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  resource: string;

  @PrimaryColumn()
  uuid_element: string;

  @Column()
  element: string;
}
