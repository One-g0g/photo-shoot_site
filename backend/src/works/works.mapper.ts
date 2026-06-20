import type { PublicUser } from '../auth/auth.types';
import { toPublicUser } from '../auth/auth.mapper';
import type { Work } from './work.entity';

export type WorkResponse = {
  id: string;
  title: string;
  category: string;
  year: number;
  status: Work['status'];
  image?: string;
  images?: string[];
  description?: string;
  createdAt: string;
};

function resolveWorkImages(work: Work): string[] {
  if (work.images?.length) {
    return work.images;
  }

  if (work.image) {
    return [work.image];
  }

  return [];
}

export function toWorkResponse(work: Work): WorkResponse {
  const images = resolveWorkImages(work);
  const payload: WorkResponse = {
    id: work.id,
    title: work.title,
    category: work.category,
    year: work.year,
    status: work.status,
    createdAt: work.createdAt.toISOString(),
  };

  if (images.length) {
    payload.images = images;
    payload.image = images[0];
  }

  if (work.description) {
    payload.description = work.description;
  }

  return payload;
}

export type CatalogWorkResponse = WorkResponse & {
  photographer: PublicUser;
};

export function toCatalogWorkResponse(work: Work): CatalogWorkResponse {
  return {
    ...toWorkResponse(work),
    photographer: toPublicUser(work.user),
  };
}
