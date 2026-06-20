import { apiFetch } from './client'
import type { User } from '~/composables/useUser'

export type Work = {
  id: string
  title: string
  category: string
  year: number
  image?: string
  images?: string[]
  description?: string
  createdAt: string
}

const WORK_PLACEHOLDER = '/examples/1.png'

export function normalizeMultilineText(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

import { getApiOrigin } from '~/utils/api-origin'

export function resolveWorkImage(image?: string | null) {
  const src = image?.trim()
  if (!src) return WORK_PLACEHOLDER

  if (src.startsWith('/uploads/')) {
    const config = useRuntimeConfig()
    const origin = getApiOrigin(config.public.apiOrigin as string)
    return `${origin}${src}`
  }

  return src
}

export function resolveWorkImages(work: Pick<Work, 'image' | 'images'>) {
  let list: string[] = []

  if (Array.isArray(work.images) && work.images.length) {
    list = work.images
  } else if (work.image) {
    list = [work.image]
  }

  return list.map((item) => resolveWorkImage(item))
}

export type WorkResponse = {
  work: Work
}

export type WorksListResponse = {
  works: Work[]
}

export type CreateWorkPayload = {
  title: string
  category: string
  description?: string
}

export function createWork(
  payload: CreateWorkPayload,
  files: File[],
  accessToken: string,
) {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('category', payload.category)
  const description = payload.description
    ? normalizeMultilineText(payload.description)
    : ''
  if (description) {
    formData.append('description', description)
  }
  for (const file of files) {
    formData.append('files', file)
  }

  return apiFetch<WorkResponse>('/works/me', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function updateWork(
  workId: string,
  payload: CreateWorkPayload,
  accessToken: string,
  files?: File[] | null,
) {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('category', payload.category)
  formData.append(
    'description',
    payload.description ? normalizeMultilineText(payload.description) : '',
  )
  if (files?.length) {
    for (const file of files) {
      formData.append('files', file)
    }
  }

  return apiFetch<WorkResponse>(`/works/me/${encodeURIComponent(workId)}`, {
    method: 'PATCH',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function fetchMyWorks(accessToken: string) {
  return apiFetch<WorksListResponse>('/works/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export type PublicProfileWork = Work & {
  likesCount: number
  likedByMe: boolean
}

export type PublicProfileWorksResponse = {
  works: PublicProfileWork[]
}

export function fetchPublicWorks(userId: string, accessToken?: string | null) {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined

  return apiFetch<PublicProfileWorksResponse>(
    `/works/public/${encodeURIComponent(userId)}`,
    { headers },
  )
}

export type CatalogWorkFromApi = Work & {
  photographer: User
  likesCount: number
  likedByMe: boolean
}

export type CatalogWorksResponse = {
  works: CatalogWorkFromApi[]
}

export function fetchCatalogWorks(accessToken?: string | null) {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined

  return apiFetch<CatalogWorksResponse>('/works/public/catalog', { headers })
}

export type PublicWorkDetailResponse = {
  work: Work
  photographer: User
  likesCount: number
  likedByMe: boolean
  viewsCount: number
}

export type WorkViewResponse = {
  viewsCount: number
  recorded: boolean
}

export type WorkLikeResponse = {
  likesCount: number
  liked: boolean
}

export function fetchPublicWork(workId: string, accessToken?: string | null) {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined

  return apiFetch<PublicWorkDetailResponse>(
    `/works/${encodeURIComponent(workId)}/public`,
    { headers },
  )
}

export function recordWorkView(workId: string, accessToken: string) {
  return apiFetch<WorkViewResponse>(`/works/${encodeURIComponent(workId)}/view`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function likeWork(workId: string, accessToken: string) {
  return apiFetch<WorkLikeResponse>(`/works/${encodeURIComponent(workId)}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function unlikeWork(workId: string, accessToken: string) {
  return apiFetch<WorkLikeResponse>(`/works/${encodeURIComponent(workId)}/like`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function deleteWork(workId: string, accessToken: string) {
  return apiFetch<{ ok: boolean }>(`/works/me/${encodeURIComponent(workId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
