import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Work } from './work.entity';

@Entity('work_likes')
@Unique(['workId', 'userId'])
export class WorkLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  workId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Work, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_id' })
  work: Work;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
