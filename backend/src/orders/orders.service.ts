import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly usersService: UsersService,
  ) {}

  create(userId: string, dto: CreateOrderDto) {
    const order = this.ordersRepository.create({
      userId,
      category: dto.category.trim(),
      city: dto.city.trim(),
      phone: dto.phone.trim(),
      status: 'open',
    });

    return this.ordersRepository.save(order);
  }

  findByUserId(userId: string) {
    return this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async removeByUserId(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Заявка не найдена');
    }

    await this.ordersRepository.remove(order);
  }

  async findMatchingForPhotographer(photographerId: string) {
    const photographer = await this.usersService.findById(photographerId);

    if (!photographer) {
      throw new NotFoundException('Пользователь не найден');
    }

    const photographerCity = photographer.city?.trim();
    if (!photographerCity) {
      return [];
    }

    return this.ordersRepository
      .createQueryBuilder('searchOrder')
      .innerJoinAndSelect('searchOrder.user', 'client')
      .where('searchOrder.status = :status', { status: 'open' })
      .andWhere('searchOrder.userId != :photographerId', { photographerId })
      .andWhere(
        'LOWER(TRIM(searchOrder.city)) = LOWER(TRIM(:photographerCity))',
        { photographerCity },
      )
      .andWhere(
        `EXISTS (
          SELECT 1 FROM works portfolioWork
          WHERE portfolioWork.user_id = :photographerId
            AND portfolioWork.status = :approvedStatus
            AND LOWER(TRIM(portfolioWork.category)) = LOWER(TRIM(searchOrder.category))
        )`,
        { photographerId, approvedStatus: 'approved' },
      )
      .orderBy('searchOrder.createdAt', 'DESC')
      .getMany();
  }
}
