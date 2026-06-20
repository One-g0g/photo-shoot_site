import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type WorkStatus = 'approved';

@Entity('works')
export class Work {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 80 })
  category: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 20, default: 'approved' })
  status: WorkStatus;

  @Column({ type: 'varchar', length: 512, nullable: true })
  image: string | null;

  @Column({ type: 'simple-json', nullable: true })
  images: string[] | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  description: string | null;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
