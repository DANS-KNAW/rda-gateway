import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IndividualResource {
  @PrimaryColumn()
  uuid_individual: string;

  @Column()
  individual: string;

  @Column()
  relation_uuid: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  resource: string;
}
