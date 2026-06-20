import type { User, UserRole } from '~/composables/useUser'

export type AuthResponse = {
  user: User
  accessToken: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  role?: UserRole
}

export type LoginPayload = {
  email: string
  password: string
}

export type MeResponse = {
  user: User
}
