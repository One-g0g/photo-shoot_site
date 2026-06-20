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

@Entity('photographer_subscriptions')
@Unique(['subscriberId', 'photographerId'])
export class PhotographerSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscriber_id' })
  subscriberId: string;

  @Column({ name: 'photographer_id' })
  photographerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriber_id' })
  subscriber: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographer_id' })
  photographer: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
