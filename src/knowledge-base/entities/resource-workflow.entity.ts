import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceWorkflow {
  @PrimaryColumn()
  uuid_resource: string;

  @Column()
  title: string;

  @PrimaryColumn()
  uuid_adoption_state: string;

  @Column()
  status: string;
}
