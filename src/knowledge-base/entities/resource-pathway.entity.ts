import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourcePathway {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  resource: string;

  @Column()
  relation_uuid: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  uuid_pathway: string;

  @Column()
  pathway: string;
}
