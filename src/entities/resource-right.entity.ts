import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceRight {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  relation_uuid: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  lod_pid: string;

  @Column()
  status: string;

  @Column()
  type: string;
}
