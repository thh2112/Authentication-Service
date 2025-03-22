import { USER_STATUS } from 'src/shared/constant';
import { Audit } from 'src/shared/models/audit.model';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User extends Audit {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column({ unique: true })
  public email: string;

  @Column({ name: 'role_id' })
  public roleId: string;

  @Column({ name: 'phone_number', nullable: true })
  public phoneNumber: string;

  @Column({ name: 'is_verify' })
  public isVerify: boolean;

  @Column({ name: 'is_active' })
  public status: USER_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  public metadata: Record<string, any>;
}
