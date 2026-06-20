export function getApiOrigin(configuredOrigin: string): string {
  if (import.meta.server) {
    const internal = process.env.NUXT_API_ORIGIN_INTERNAL?.trim()
    return internal || configuredOrigin
  }

  if (import.meta.dev && typeof window !== 'undefined') {
    const parsed = new URL(configuredOrigin)
    const port = parsed.port || '3001'
    return `${window.location.protocol}//${window.location.hostname}:${port}`
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return configuredOrigin
}

export function getApiBaseUrl(config: {
  public: { apiOrigin: string; apiUrl: string }
}): string {
  const configuredOrigin = config.public.apiOrigin as string

  if (import.meta.server) {
    return `${configuredOrigin}/api`
  }

  if (import.meta.dev && typeof window !== 'undefined') {
    return `${getApiOrigin(configuredOrigin)}/api`
  }

  return config.public.apiUrl as string
}
