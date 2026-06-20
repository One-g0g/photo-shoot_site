import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

export type ContactField = 'vkUrl' | 'telegramUrl' | 'contactEmail';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        passwordHash: true,
      },
    });
  }

  findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }) {
    const user = this.usersRepository.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role ?? 'client',
    });

    return this.usersRepository.save(user);
  }

  async updateAvatar(userId: string, avatar: string | null) {
    await this.usersRepository.update({ id: userId }, { avatar });
    const user = await this.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfileBanner(userId: string, profileBanner: string | null) {
    await this.usersRepository.update({ id: userId }, { profileBanner });
    const user = await this.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private normalizeContactValue(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private assertValidContact(field: ContactField, value: string | null) {
    if (!value) {
      return;
    }

    if (field === 'contactEmail') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        throw new BadRequestException('Укажите корректный email');
      }
      return;
    }

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('invalid protocol');
      }
    } catch {
      throw new BadRequestException('Укажите корректную ссылку (https://…)');
    }
  }

  async updateContactField(userId: string, field: ContactField, value: string) {
    const normalized = this.normalizeContactValue(value);
    this.assertValidContact(field, normalized);

    await this.usersRepository.update({ id: userId }, { [field]: normalized });
    const user = await this.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, name: string, city?: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new BadRequestException('Укажите имя');
    }

    const trimmedCity = city?.trim() ?? '';
    const normalizedCity = trimmedCity.length > 0 ? trimmedCity : null;

    await this.usersRepository.update(
      { id: userId },
      { name: trimmedName, city: normalizedCity },
    );

    const user = await this.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
