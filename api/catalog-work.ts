import { resolveUserAvatar, type User } from '~/composables/useUser'
import {
  getPortfolioWork,
  getWorksByPhotographer,
  type PortfolioWork,
} from '~/data/portfolio-works'
import {
  fetchPublicWork,
  fetchPublicWorks,
  normalizeMultilineText,
  resolveWorkImage,
  resolveWorkImages,
  type Work,
} from '~/api/works'

export type CatalogWorkView = {
  id: string
  title: string
  image: string
  images: string[]
  category: string
  year: number
  photographer: string
  photographerId: string
  photographerAvatar: string
  description: string
  location: string
  tags: string[]
  likes: number
  likedByMe: boolean
  views: number
  publishedAt: string
  source: 'api' | 'mock'
}

function fromApi(
  work: Work,
  photographer: User,
  likesCount: number,
  likedByMe: boolean,
  viewsCount: number,
): CatalogWorkView {
  const images = resolveWorkImages(work)

  return {
    id: work.id,
    title: work.title,
    image: images[0] ?? resolveWorkImage(work.image),
    images,
    category: work.category,
    year: work.year,
    photographer: photographer.name,
    photographerId: photographer.id,
    photographerAvatar: resolveUserAvatar(photographer.avatar),
    description: work.description
      ? normalizeMultilineText(work.description)
      : `Работа в категории «${work.category}». Автор: ${photographer.name}.`,
    location: '—',
    tags: [work.category],
    likes: likesCount ?? 0,
    likedByMe,
    views: viewsCount ?? 0,
    publishedAt: new Date(work.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    source: 'api',
  }
}

function fromMock(mock: PortfolioWork): CatalogWorkView {
  return {
    id: mock.id,
    title: mock.title,
    image: mock.image,
    images: [mock.image],
    category: mock.category,
    year: mock.year,
    photographer: mock.photographer,
    photographerId: mock.photographerId,
    photographerAvatar: mock.photographerAvatar,
    description: mock.description,
    location: mock.location,
    tags: mock.tags,
    likes: mock.likes,
    likedByMe: false,
    views: mock.views,
    publishedAt: mock.publishedAt,
    source: 'mock',
  }
}

function isNotFoundError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const record = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }

  return (
    record.statusCode === 404
    || record.status === 404
    || record.response?.status === 404
  )
}

export async function loadCatalogWork(
  workId: string,
  accessToken?: string | null,
): Promise<CatalogWorkView | null> {
  if (!workId) return null

  const mock = getPortfolioWork(workId)
  const isMockId = /^\d+$/.test(workId)

  try {
    const detail = await fetchPublicWork(workId, accessToken)
    return fromApi(
      detail.work,
      detail.photographer,
      detail.likesCount,
      detail.likedByMe,
      detail.viewsCount,
    )
  } catch (error) {
    if (!isMockId && !isNotFoundError(error)) {
      throw error
    }
  }

  return mock ? fromMock(mock) : null
}

export function getMockPhotographerWorksCount(photographerId: string) {
  return getWorksByPhotographer(photographerId).length
}

export async function getApiPhotographerWorksCount(photographerId: string) {
  const { works } = await fetchPublicWorks(photographerId)
  return works.length
}
