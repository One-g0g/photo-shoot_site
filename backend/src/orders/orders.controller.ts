import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { PublicUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { toOrderResponse, toPhotographerOrderResponse } from './orders.mapper';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('matching')
  @UseGuards(AuthGuard('jwt'))
  async listMatching(@CurrentUser() currentUser: PublicUser) {
    const orders = await this.ordersService.findMatchingForPhotographer(
      currentUser.id,
    );

    return {
      orders: orders.map(toPhotographerOrderResponse),
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async listMine(@CurrentUser() currentUser: PublicUser) {
    const orders = await this.ordersService.findByUserId(currentUser.id);
    return { orders: orders.map(toOrderResponse) };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @CurrentUser() currentUser: PublicUser,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.ordersService.create(currentUser.id, dto);
    return { order: toOrderResponse(order) };
  }

  @Delete('me/:id')
  @UseGuards(AuthGuard('jwt'))
  async removeMine(
    @CurrentUser() currentUser: PublicUser,
    @Param('id') orderId: string,
  ) {
    await this.ordersService.removeByUserId(currentUser.id, orderId);
    return { ok: true };
  }
}
