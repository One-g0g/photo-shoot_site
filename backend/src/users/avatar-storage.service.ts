import { Injectable, Logger } from '@nestjs/common';
import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const AVATAR_SIZE = 256;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

@Injectable()
export class AvatarStorageService {
  private readonly logger = new Logger(AvatarStorageService.name);
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  async save(userId: string, file: Express.Multer.File): Promise<string> {
    const dir = join(this.uploadsRoot, 'avatars', userId);
    await mkdir(dir, { recursive: true });

    const outputPath = join(dir, 'avatar.webp');
    await sharp(file.buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const avatarPath = `/uploads/avatars/${userId}/avatar.webp`;
    this.logger.log(`Аватар сохранён: ${avatarPath}`);

    return `${avatarPath}?t=${Date.now()}`;
  }

  async remove(userId: string): Promise<void> {
    const filePath = join(this.uploadsRoot, 'avatars', userId, 'avatar.webp');
    await unlink(filePath).catch(() => undefined);
    this.logger.log(`Аватар удалён: userId=${userId}`);
  }

  static assertFile(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
    if (!file) {
      throw new Error('FILE_REQUIRED');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new Error('FILE_INVALID_TYPE');
    }
  }
}
