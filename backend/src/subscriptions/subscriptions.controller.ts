import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { PublicUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { toSubscriptionResponse } from './subscriptions.mapper';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async listMine(@CurrentUser() currentUser: PublicUser) {
    const subscriptions = await this.subscriptionsService.findBySubscriberId(
      currentUser.id,
    );

    return {
      subscriptions: subscriptions.map(toSubscriptionResponse),
    };
  }

  @Get('count/:userId')
  async countSubscribers(@Param('userId') userId: string) {
    const subscribersCount =
      await this.subscriptionsService.getSubscribersCount(userId);

    return { subscribersCount };
  }

  @Get('status/:photographerId')
  @UseGuards(AuthGuard('jwt'))
  async status(
    @CurrentUser() currentUser: PublicUser,
    @Param('photographerId') photographerId: string,
  ) {
    const subscribed = await this.subscriptionsService.isSubscribed(
      currentUser.id,
      photographerId,
    );

    return { subscribed };
  }

  @Post(':photographerId')
  @UseGuards(AuthGuard('jwt'))
  async subscribe(
    @CurrentUser() currentUser: PublicUser,
    @Param('photographerId') photographerId: string,
  ) {
    const subscription = await this.subscriptionsService.subscribe(
      currentUser.id,
      photographerId,
    );

    return { subscription: toSubscriptionResponse(subscription) };
  }

  @Delete(':photographerId')
  @UseGuards(AuthGuard('jwt'))
  async unsubscribe(
    @CurrentUser() currentUser: PublicUser,
    @Param('photographerId') photographerId: string,
  ) {
    await this.subscriptionsService.unsubscribe(
      currentUser.id,
      photographerId,
    );

    return { ok: true };
  }
}
