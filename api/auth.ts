import { apiFetch } from './client'
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload } from './types'

export function registerUser(payload: RegisterPayload) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function loginUser(payload: LoginPayload) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function fetchMe(accessToken: string) {
  return apiFetch<MeResponse>('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
