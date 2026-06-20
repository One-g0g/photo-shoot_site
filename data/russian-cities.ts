import cityNames from './russian-city-names.json'

export const RUSSIAN_CITY_NAMES = cityNames as string[]

export function searchRussianCities(query: string, limit = 8) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return RUSSIAN_CITY_NAMES.slice(0, limit)
  }

  const startsWith: string[] = []
  const includes: string[] = []

  for (const city of RUSSIAN_CITY_NAMES) {
    const lower = city.toLowerCase()
    if (lower.startsWith(normalized)) {
      startsWith.push(city)
    } else if (lower.includes(normalized)) {
      includes.push(city)
    }

    if (startsWith.length >= limit && includes.length >= limit) {
      break
    }
  }

  return [...startsWith, ...includes].slice(0, limit)
}

export function isRussianCity(value: string) {
  return RUSSIAN_CITY_NAMES.includes(value.trim())
}
