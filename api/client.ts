import type { FetchOptions } from 'ofetch'
import { getApiBaseUrl } from '~/utils/api-origin'

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) {
      return data.message[0] ?? 'Ошибка запроса'
    }
    if (typeof data?.message === 'string') {
      return data.message
    }
  }

  return 'Не удалось выполнить запрос. Попробуйте позже.'
}

export function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  const config = useRuntimeConfig()
  const baseURL = getApiBaseUrl(config)

  return $fetch<T>(path, { baseURL, ...options })
}
