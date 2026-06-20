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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { PublicUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { toPublicUser } from '../auth/auth.mapper';
import { AvatarStorageService } from './avatar-storage.service';
import { UpdateContactValueDto } from './dto/update-contact-value.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileBannerStorageService } from './profile-banner-storage.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly avatarStorage: AvatarStorageService,
    private readonly profileBannerStorage: ProfileBannerStorageService,
  ) {}

  private mapFileError(error: unknown, maxSizeLabel: string) {
    const code = error instanceof Error ? error.message : 'FILE_INVALID';
    if (code === 'FILE_REQUIRED') {
      return 'Файл не передан';
    }
    if (code === 'FILE_TOO_LARGE') {
      return `Файл больше ${maxSizeLabel}`;
    }
    return 'Допустимы только JPG, PNG или WebP';
  }

  @Get(':id/public')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { user: toPublicUser(user) };
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @CurrentUser() currentUser: PublicUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      AvatarStorageService.assertFile(file);
    } catch (error) {
      throw new BadRequestException(this.mapFileError(error, '2 МБ'));
    }

    this.logger.log(`Загрузка аватара: userId=${currentUser.id}`);

    const avatar = await this.avatarStorage.save(currentUser.id, file);
    const user = await this.usersService.updateAvatar(currentUser.id, avatar);

    return { user: toPublicUser(user) };
  }

  @Patch('me/profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @CurrentUser() currentUser: PublicUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      currentUser.id,
      dto.name,
      dto.city,
    );

    return { user: toPublicUser(user) };
  }

  @Patch('me/contacts/vk')
  @UseGuards(AuthGuard('jwt'))
  async updateVkContact(
    @CurrentUser() currentUser: PublicUser,
    @Body() dto: UpdateContactValueDto,
  ) {
    const user = await this.usersService.updateContactField(
      currentUser.id,
      'vkUrl',
      dto.value,
    );

    return { user: toPublicUser(user) };
  }

  @Patch('me/contacts/telegram')
  @UseGuards(AuthGuard('jwt'))
  async updateTelegramContact(
    @CurrentUser() currentUser: PublicUser,
    @Body() dto: UpdateContactValueDto,
  ) {
    const user = await this.usersService.updateContactField(
      currentUser.id,
      'telegramUrl',
      dto.value,
    );

    return { user: toPublicUser(user) };
  }

  @Patch('me/contacts/email')
  @UseGuards(AuthGuard('jwt'))
  async updateEmailContact(
    @CurrentUser() currentUser: PublicUser,
    @Body() dto: UpdateContactValueDto,
  ) {
    const user = await this.usersService.updateContactField(
      currentUser.id,
      'contactEmail',
      dto.value,
    );

    return { user: toPublicUser(user) };
  }

  @Post('me/profile-banner')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProfileBanner(
    @CurrentUser() currentUser: PublicUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      ProfileBannerStorageService.assertFile(file);
    } catch (error) {
      throw new BadRequestException(this.mapFileError(error, '5 МБ'));
    }

    this.logger.log(`Загрузка баннера: userId=${currentUser.id}`);

    const profileBanner = await this.profileBannerStorage.save(
      currentUser.id,
      file,
    );
    const user = await this.usersService.updateProfileBanner(
      currentUser.id,
      profileBanner,
    );

    return { user: toPublicUser(user) };
  }

  @Delete('me/profile-banner')
  @UseGuards(AuthGuard('jwt'))
  async removeProfileBanner(@CurrentUser() currentUser: PublicUser) {
    this.logger.log(`Сброс баннера: userId=${currentUser.id}`);

    await this.profileBannerStorage.remove(currentUser.id);
    const user = await this.usersService.updateProfileBanner(
      currentUser.id,
      null,
    );

    return { user: toPublicUser(user) };
  }

  @Delete('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  async removeAvatar(@CurrentUser() currentUser: PublicUser) {
    this.logger.log(`Сброс аватара: userId=${currentUser.id}`);

    await this.avatarStorage.remove(currentUser.id);
    const user = await this.usersService.updateAvatar(currentUser.id, null);

    return { user: toPublicUser(user) };
  }
}
