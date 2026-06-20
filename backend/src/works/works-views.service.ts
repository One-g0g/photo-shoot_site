import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkView } from './work-view.entity';
import { Work } from './work.entity';

@Injectable()
export class WorksViewsService {
  constructor(
    @InjectRepository(WorkView)
    private readonly workViewsRepository: Repository<WorkView>,
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
  ) {}

  async getCount(workId: string) {
    return this.workViewsRepository.count({ where: { workId } });
  }

  private async assertApprovedWork(workId: string) {
    const work = await this.worksRepository.findOne({
      where: { id: workId, status: 'approved' },
      select: { id: true },
    });

    if (!work) {
      throw new NotFoundException('Работа не найдена');
    }
  }

  async recordView(
    workId: string,
    userId: string,
  ): Promise<{ viewsCount: number; recorded: boolean }> {
    await this.assertApprovedWork(workId);

    const existing = await this.workViewsRepository.findOne({
      where: { workId, userId },
      select: { id: true },
    });

    if (existing) {
      return {
        viewsCount: await this.getCount(workId),
        recorded: false,
      };
    }

    try {
      await this.workViewsRepository.save(
        this.workViewsRepository.create({ workId, userId }),
      );
    } catch {
      // гонка при параллельных запросах — уникальный индекс work_id + user_id
    }

    return {
      viewsCount: await this.getCount(workId),
      recorded: true,
    };
  }
}
