import { Injectable, Logger } from '@nestjs/common';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_EDGE = 1920;
const MAX_PHOTOS = 3;

@Injectable()
export class WorkImageStorageService {
  private readonly logger = new Logger(WorkImageStorageService.name);
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  async saveAll(
    workId: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (files.length === 0) {
      throw new Error('FILE_REQUIRED');
    }

    if (files.length > MAX_PHOTOS) {
      throw new Error('FILE_TOO_MANY');
    }

    const dir = join(this.uploadsRoot, 'works', workId);
    await mkdir(dir, { recursive: true });

    const timestamp = Date.now();
    const paths: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const outputPath = join(dir, `${index + 1}.webp`);
      await sharp(files[index].buffer)
        .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);

      paths.push(`/uploads/works/${workId}/${index + 1}.webp?t=${timestamp}`);
    }

    for (let slot = files.length + 1; slot <= MAX_PHOTOS; slot += 1) {
      await rm(join(dir, `${slot}.webp`), { force: true }).catch(() => undefined);
      await rm(join(dir, 'cover.webp'), { force: true }).catch(() => undefined);
    }

    this.logger.log(
      `Фото работы сохранены: workId=${workId}, count=${files.length}`,
    );

    return paths;
  }

  async remove(workId: string): Promise<void> {
    const dir = join(this.uploadsRoot, 'works', workId);
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    this.logger.log(`Файлы работы удалены: workId=${workId}`);
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

  static assertFiles(files: Express.Multer.File[] | undefined): asserts files is Express.Multer.File[] {
    if (!files?.length) {
      throw new Error('FILE_REQUIRED');
    }

    if (files.length > MAX_PHOTOS) {
      throw new Error('FILE_TOO_MANY');
    }

    for (const file of files) {
      WorkImageStorageService.assertFile(file);
    }
  }
}
