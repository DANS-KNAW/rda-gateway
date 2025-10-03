import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GroupGroup {
  @PrimaryColumn()
  UUID_Group1: string;

  @Column()
  Title_Group1: string;

  @Column()
  Relation: string;

  @PrimaryColumn()
  UUID_Group2: string;

  @Column()
  Title_Group2: string;

  @Column()
  Relation_Description: string;

  @Column()
  Description_source: string;

  @Column()
  Description_URL: string;

  @Column()
  Description_URL_Backup: string;
}
