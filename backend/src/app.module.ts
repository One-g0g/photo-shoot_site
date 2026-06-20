import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { Order } from './orders/order.entity';
import { OrdersModule } from './orders/orders.module';
import { PhotographerSubscription } from './subscriptions/photographer-subscription.entity';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WorkLike } from './works/work-like.entity';
import { WorkView } from './works/work-view.entity';
import { Work } from './works/work.entity';
import { WorksModule } from './works/works.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'photoshoot'),
        password: config.get<string>('DATABASE_PASSWORD', 'photoshoot'),
        database: config.get<string>('DATABASE_NAME', 'photoshoot'),
        entities: [User, Work, WorkLike, WorkView, Order, PhotographerSubscription],
        synchronize:
          config.get<string>('DATABASE_SYNCHRONIZE') === 'true'
          || (config.get<string>('DATABASE_SYNCHRONIZE') !== 'false'
            && config.get<string>('NODE_ENV', 'development') !== 'production'),
      }),
    }),
    UsersModule,
    WorksModule,
    OrdersModule,
    SubscriptionsModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
