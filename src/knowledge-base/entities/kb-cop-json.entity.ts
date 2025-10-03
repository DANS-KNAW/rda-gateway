import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class KbCopJson {
  @PrimaryColumn()
  id: string;

  @Column()
  uuid_othergroup: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  url: string;

  @Column()
  domains: string;

  @Column()
  eventtype: string;

  @Column()
  last_update: Date;
}
