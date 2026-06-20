import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PhotographerSubscription } from './photographer-subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(PhotographerSubscription)
    private readonly subscriptionsRepository: Repository<PhotographerSubscription>,
    private readonly usersService: UsersService,
  ) {}

  findBySubscriberId(subscriberId: string) {
    return this.subscriptionsRepository.find({
      where: { subscriberId },
      relations: { photographer: true },
      order: { createdAt: 'DESC' },
    });
  }

  countSubscribers(userId: string) {
    return this.subscriptionsRepository.count({
      where: { photographerId: userId },
    });
  }

  async isSubscribed(subscriberId: string, photographerId: string) {
    const existing = await this.subscriptionsRepository.findOne({
      where: { subscriberId, photographerId },
      select: { id: true },
    });

    return Boolean(existing);
  }

  async getSubscribersCount(userId: string) {
    await this.assertTargetUser(userId);
    return this.countSubscribers(userId);
  }

  private async assertTargetUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async subscribe(subscriberId: string, photographerId: string) {
    if (subscriberId === photographerId) {
      throw new BadRequestException('Нельзя подписаться на себя');
    }

    await this.assertTargetUser(photographerId);

    const existing = await this.subscriptionsRepository.findOne({
      where: { subscriberId, photographerId },
      relations: { photographer: true },
    });

    if (existing) {
      return existing;
    }

    const saved = await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({ subscriberId, photographerId }),
    );

    return this.subscriptionsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { photographer: true },
    });
  }

  async unsubscribe(subscriberId: string, photographerId: string) {
    await this.assertTargetUser(photographerId);
    await this.subscriptionsRepository.delete({ subscriberId, photographerId });
  }
}
