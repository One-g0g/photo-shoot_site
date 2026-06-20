import { apiFetch } from './client'
import type { User } from '~/composables/useUser'

export type UserResponse = {
  user: User
}

export type UpdateProfilePayload = {
  name: string
  city?: string
}

export function updateUserProfile(payload: UpdateProfilePayload, accessToken: string) {
  return apiFetch<UserResponse>('/users/me/profile', {
    method: 'PATCH',
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function uploadUserAvatar(file: File, accessToken: string) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch<UserResponse>('/users/me/avatar', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function removeUserAvatar(accessToken: string) {
  return apiFetch<UserResponse>('/users/me/avatar', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function uploadProfileBanner(file: File, accessToken: string) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch<UserResponse>('/users/me/profile-banner', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function removeProfileBanner(accessToken: string) {
  return apiFetch<UserResponse>('/users/me/profile-banner', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function fetchPublicUser(userId: string) {
  return apiFetch<UserResponse>(`/users/${encodeURIComponent(userId)}/public`)
}

export type ContactKind = 'vk' | 'telegram' | 'email'

const contactEndpoints: Record<ContactKind, string> = {
  vk: '/users/me/contacts/vk',
  telegram: '/users/me/contacts/telegram',
  email: '/users/me/contacts/email',
}

export function updateUserContact(
  kind: ContactKind,
  value: string,
  accessToken: string,
) {
  return apiFetch<UserResponse>(contactEndpoints[kind], {
    method: 'PATCH',
    body: { value },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
