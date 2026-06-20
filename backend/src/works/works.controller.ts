import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { PublicUser } from '../auth/auth.types';
import { toPublicUser } from '../auth/auth.mapper';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalCurrentUser } from '../auth/optional-current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { WorkImageStorageService } from './work-image-storage.service';
import { toCatalogWorkResponse, toWorkResponse } from './works.mapper';
import { WorksLikesService } from './works-likes.service';
import { WorksViewsService } from './works-views.service';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  private readonly logger = new Logger(WorksController.name);

  constructor(
    private readonly worksService: WorksService,
    private readonly worksLikesService: WorksLikesService,
    private readonly worksViewsService: WorksViewsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('public/catalog')
  @UseGuards(OptionalJwtAuthGuard)
  async listCatalog(@OptionalCurrentUser() currentUser: PublicUser | null) {
    const works = await this.worksService.findAllApproved();
    const likeMeta = await this.worksLikesService.getCatalogLikeMeta(
      works.map((work) => work.id),
      currentUser?.id,
    );

    return {
      works: works.map((work) => {
        const likes = likeMeta.get(work.id) ?? { likesCount: 0, liked: false };

        return {
          ...toCatalogWorkResponse(work),
          likesCount: likes.likesCount,
          likedByMe: likes.liked,
        };
      }),
    };
  }

  @Get(':id/public')
  @UseGuards(OptionalJwtAuthGuard)
  async getPublic(
    @Param('id') workId: string,
    @OptionalCurrentUser() currentUser: PublicUser | null,
  ) {
    const work = await this.worksService.findPublicById(workId);

    if (!work) {
      throw new NotFoundException('Работа не найдена');
    }

    const photographer = await this.usersService.findById(work.userId);

    if (!photographer) {
      throw new NotFoundException('Фотограф не найден');
    }

    const { likesCount, liked } = await this.worksLikesService.getState(
      workId,
      currentUser?.id,
    );
    const viewsCount = await this.worksViewsService.getCount(workId);

    return {
      work: toWorkResponse(work),
      photographer: toPublicUser(photographer),
      likesCount,
      likedByMe: liked,
      viewsCount,
    };
  }

  @Post(':id/view')
  @UseGuards(AuthGuard('jwt'))
  async recordView(
    @Param('id') workId: string,
    @CurrentUser() currentUser: PublicUser,
  ) {
    return this.worksViewsService.recordView(workId, currentUser.id);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(
    @Param('id') workId: string,
    @CurrentUser() currentUser: PublicUser,
  ) {
    const { likesCount, liked } = await this.worksLikesService.like(
      workId,
      currentUser.id,
    );

    return { likesCount, liked };
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async unlike(
    @Param('id') workId: string,
    @CurrentUser() currentUser: PublicUser,
  ) {
    const { likesCount, liked } = await this.worksLikesService.unlike(
      workId,
      currentUser.id,
    );

    return { likesCount, liked };
  }

  @Get('public/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  async listPublic(
    @Param('userId') userId: string,
    @OptionalCurrentUser() currentUser: PublicUser | null,
  ) {
    const works = await this.worksService.findByUserId(userId);
    const likeMeta = await this.worksLikesService.getCatalogLikeMeta(
      works.map((work) => work.id),
      currentUser?.id,
    );

    return {
      works: works.map((work) => {
        const likes = likeMeta.get(work.id) ?? { likesCount: 0, liked: false };

        return {
          ...toWorkResponse(work),
          likesCount: likes.likesCount,
          likedByMe: likes.liked,
        };
      }),
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async listMine(@CurrentUser() currentUser: PublicUser) {
    const works = await this.worksService.findByUserId(currentUser.id);
    return { works: works.map(toWorkResponse) };
  }

  @Post('me')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @CurrentUser() currentUser: PublicUser,
    @Body() dto: CreateWorkDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      WorkImageStorageService.assertFiles(files);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'FILE_INVALID';
      const message =
        code === 'FILE_REQUIRED'
          ? 'Добавьте хотя бы одно фото'
          : code === 'FILE_TOO_MANY'
            ? 'Можно загрузить не более 3 фото'
            : code === 'FILE_TOO_LARGE'
              ? 'Файл больше 5 МБ'
              : 'Допустимы только JPG, PNG или WebP';
      throw new BadRequestException(message);
    }

    this.logger.log(`Создание работы: userId=${currentUser.id}`);

    const work = await this.worksService.create(currentUser.id, dto, files);
    return { work: toWorkResponse(work) };
  }

  @Patch('me/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @CurrentUser() currentUser: PublicUser,
    @Param('id') workId: string,
    @Body() dto: CreateWorkDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files?.length) {
      try {
        WorkImageStorageService.assertFiles(files);
      } catch (error) {
        const code = error instanceof Error ? error.message : 'FILE_INVALID';
        const message =
          code === 'FILE_TOO_MANY'
            ? 'Можно загрузить не более 3 фото'
            : code === 'FILE_TOO_LARGE'
              ? 'Файл больше 5 МБ'
              : 'Допустимы только JPG, PNG или WebP';
        throw new BadRequestException(message);
      }
    }

    this.logger.log(`Обновление работы: userId=${currentUser.id}, workId=${workId}`);

    const work = await this.worksService.update(
      currentUser.id,
      workId,
      dto,
      files,
    );
    return { work: toWorkResponse(work) };
  }

  @Delete('me/:id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @CurrentUser() currentUser: PublicUser,
    @Param('id') workId: string,
  ) {
    this.logger.log(`Удаление работы: userId=${currentUser.id}, workId=${workId}`);

    await this.worksService.remove(currentUser.id, workId);
    return { ok: true };
  }
}
