import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WorkLike } from './work-like.entity';
import { WorkView } from './work-view.entity';
import { Work } from './work.entity';
import { WorkImageStorageService } from './work-image-storage.service';
import { WorksController } from './works.controller';
import { WorksLikesService } from './works-likes.service';
import { WorksViewsService } from './works-views.service';
import { WorksService } from './works.service';

@Module({
  imports: [TypeOrmModule.forFeature([Work, WorkLike, WorkView]), AuthModule, UsersModule],
  controllers: [WorksController],
  providers: [WorksService, WorksLikesService, WorksViewsService, WorkImageStorageService],
})
export class WorksModule {}
