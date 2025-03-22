import { ROLE_TYPE } from 'src/shared/constant';
import { Audit } from 'src/shared/models/audit.model';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role')
export class Role extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  type: ROLE_TYPE;

  @Column({ type: 'jsonb', nullable: true })
  public metadata: Record<string, any>;
}
