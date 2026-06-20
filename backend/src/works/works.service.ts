import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkDto } from './dto/create-work.dto';
import { WorkImageStorageService } from './work-image-storage.service';
import { Work } from './work.entity';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
    private readonly workImageStorage: WorkImageStorageService,
  ) {}

  findByUserId(userId: string) {
    return this.worksRepository.find({
      where: { userId, status: 'approved' },
      order: { createdAt: 'DESC' },
    });
  }

  findPublicById(workId: string) {
    return this.worksRepository.findOne({
      where: { id: workId, status: 'approved' },
    });
  }

  findAllApproved() {
    return this.worksRepository.find({
      where: { status: 'approved' },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  private normalizeDescription(value?: string): string | null {
    if (value == null) {
      return null;
    }

    const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    return normalized.length > 0 ? normalized : null;
  }

  async create(userId: string, dto: CreateWorkDto, files: Express.Multer.File[]) {
    const description = this.normalizeDescription(dto.description);

    const work = this.worksRepository.create({
      title: dto.title.trim(),
      category: dto.category.trim(),
      year: new Date().getFullYear(),
      userId,
      status: 'approved',
      description,
    });

    const saved = await this.worksRepository.save(work);
    const images = await this.workImageStorage.saveAll(saved.id, files);

    saved.images = images;
    saved.image = images[0] ?? null;
    return this.worksRepository.save(saved);
  }

  async update(
    userId: string,
    workId: string,
    dto: CreateWorkDto,
    files?: Express.Multer.File[],
  ) {
    const work = await this.worksRepository.findOne({
      where: { id: workId, userId },
    });

    if (!work) {
      throw new NotFoundException('Работа не найдена');
    }

    work.title = dto.title.trim();
    work.category = dto.category.trim();
    work.description = this.normalizeDescription(dto.description);

    if (files?.length) {
      const images = await this.workImageStorage.saveAll(workId, files);
      work.images = images;
      work.image = images[0] ?? null;
    }

    return this.worksRepository.save(work);
  }

  async remove(userId: string, workId: string) {
    const work = await this.worksRepository.findOne({
      where: { id: workId, userId },
    });

    if (!work) {
      throw new NotFoundException('Работа не найдена');
    }

    await this.workImageStorage.remove(workId);
    await this.worksRepository.remove(work);
  }
}
