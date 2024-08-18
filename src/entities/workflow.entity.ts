import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryColumn()
  UUID_Workflow: string;

  @Column()
  WorkflowState: string;

  @Column()
  Description: string;
}
