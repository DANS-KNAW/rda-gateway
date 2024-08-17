import { Column, Entity } from 'typeorm';

@Entity()
export class IndividualResource {
  @Column()
  uuid_individual: string;

  @Column()
  individual: string;

  @Column()
  relation_uuid: string;

  @Column()
  relation: string;

  @Column()
  uuid_resource: string;

  @Column()
  resource: string;
}
