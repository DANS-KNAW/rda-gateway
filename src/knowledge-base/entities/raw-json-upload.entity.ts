import { Column, Entity } from 'typeorm';

@Entity()
export class RawJsonUpload {
  @Column({ type: 'jsonb' })
  data: object;
}
