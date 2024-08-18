import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Right {
  @PrimaryColumn()
  lod_pid: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  data_source: string;
}
