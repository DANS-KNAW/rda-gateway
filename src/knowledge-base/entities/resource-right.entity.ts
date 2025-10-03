import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceRight {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  uuid_relation: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  lod_pid: string;

  @Column()
  type: string;
}
