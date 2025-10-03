import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceRelation {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  uuid_relation: string;

  @Column()
  relation: string;

  @Column()
  lod_pid: string;

  @Column()
  uuid_relation_type: string;

  @Column()
  relation_type: string;
}
