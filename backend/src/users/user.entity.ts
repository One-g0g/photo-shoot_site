import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'client' | 'photographer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'client' })
  role: UserRole;

  @Column({ type: 'varchar', length: 512, nullable: true })
  avatar: string | null;

  @Column({ name: 'profile_banner', type: 'varchar', length: 512, nullable: true })
  profileBanner: string | null;

  @Column({ name: 'vk_url', type: 'varchar', length: 255, nullable: true })
  vkUrl: string | null;

  @Column({ name: 'telegram_url', type: 'varchar', length: 255, nullable: true })
  telegramUrl: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
