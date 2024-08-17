import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GroupResource {
  @PrimaryColumn()
  uuid_group: string;

  @Column()
  title_group: string;

  @Column()
  relation_uuid: string;

  @Column()
  relation: string;

  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  title_resource: string;
}
