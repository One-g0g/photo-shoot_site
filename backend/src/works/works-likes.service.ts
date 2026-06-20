import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WorkLike } from './work-like.entity';
import { Work } from './work.entity';

export type WorkLikeState = {
  likesCount: number;
  liked: boolean;
};

@Injectable()
export class WorksLikesService {
  constructor(
    @InjectRepository(WorkLike)
    private readonly workLikesRepository: Repository<WorkLike>,
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
  ) {}

  async getCount(workId: string) {
    return this.workLikesRepository.count({ where: { workId } });
  }

  async isLikedByUser(workId: string, userId: string) {
    const existing = await this.workLikesRepository.findOne({
      where: { workId, userId },
      select: { id: true },
    });

    return Boolean(existing);
  }

  async getCatalogLikeMeta(workIds: string[], userId?: string | null) {
    const meta = new Map<string, WorkLikeState>();

    if (workIds.length === 0) {
      return meta;
    }

    const countsRaw = await this.workLikesRepository
      .createQueryBuilder('like')
      .select('like.workId', 'workId')
      .addSelect('COUNT(*)', 'count')
      .where('like.workId IN (:...workIds)', { workIds })
      .groupBy('like.workId')
      .getRawMany<{ workId: string; count: string }>();

    const counts = new Map(
      countsRaw.map((row) => [row.workId, Number(row.count)]),
    );

    let likedIds = new Set<string>();
    if (userId) {
      const liked = await this.workLikesRepository.find({
        where: { userId, workId: In(workIds) },
        select: { workId: true },
      });
      likedIds = new Set(liked.map((item) => item.workId));
    }

    for (const workId of workIds) {
      meta.set(workId, {
        likesCount: counts.get(workId) ?? 0,
        liked: likedIds.has(workId),
      });
    }

    return meta;
  }

  async getState(workId: string, userId?: string | null): Promise<WorkLikeState> {
    const likesCount = await this.getCount(workId);

    if (!userId) {
      return { likesCount, liked: false };
    }

    const liked = await this.isLikedByUser(workId, userId);
    return { likesCount, liked };
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

  async like(workId: string, userId: string): Promise<WorkLikeState> {
    await this.assertApprovedWork(workId);

    const existing = await this.workLikesRepository.findOne({
      where: { workId, userId },
    });

    if (!existing) {
      await this.workLikesRepository.save(
        this.workLikesRepository.create({ workId, userId }),
      );
    }

    return this.getState(workId, userId);
  }

  async unlike(workId: string, userId: string): Promise<WorkLikeState> {
    await this.assertApprovedWork(workId);

    await this.workLikesRepository.delete({ workId, userId });

    return this.getState(workId, userId);
  }
}
