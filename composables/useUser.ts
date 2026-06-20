import { fetchMe, loginUser, registerUser } from '~/api/auth'
import type { LoginPayload, RegisterPayload } from '~/api/types'
import { uploadUserAvatar } from '~/api/users'
import { getApiOrigin } from '~/utils/api-origin'

export type UserRole = 'client' | 'photographer'

export const DEFAULT_AVATAR = '/avatar/default_avatar.png'

export const DEFAULT_PROFILE_BANNER_CLASS =
  'bg-[radial-gradient(circle_at_20%_20%,rgba(32,212,137,0.2),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(17,24,39,0.08),transparent_40%),linear-gradient(120deg,#f2f7f4,#f8fbfa)]'

const ACCESS_TOKEN_KEY = 'photo-shoot-access-token'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  profileBanner?: string
  vkUrl?: string
  telegramUrl?: string
  contactEmail?: string
  city?: string
}

function resolveUploadPath(path?: string | null) {
  const src = path?.trim()
  if (!src) return null

  if (src.startsWith('/uploads/')) {
    const config = useRuntimeConfig()
    const origin = getApiOrigin(config.public.apiOrigin as string)
    return `${origin}${src}`
  }

  return src
}

export function resolveUserAvatar(avatar?: string | null) {
  return resolveUploadPath(avatar) ?? DEFAULT_AVATAR
}

export function resolveProfileBanner(profileBanner?: string | null) {
  return resolveUploadPath(profileBanner)
}

function readStoredToken() {
  if (!import.meta.client) return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function writeStoredToken(token: string | null) {
  if (!import.meta.client) return
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

export function useUser() {
  const user = useState<User | null>('photo-shoot-user', () => null)
  const accessToken = useState<string | null>('photo-shoot-access-token', () => null)

  const isLoggedIn = computed(() => user.value !== null)

  const cabinetPath = computed(() =>
    user.value?.role === 'photographer' ? '/cabinet/photographer' : '/cabinet/client',
  )

  const userAvatar = computed(() => resolveUserAvatar(user.value?.avatar))

  function setSession(payload: { user: User; accessToken: string }) {
    user.value = payload.user
    accessToken.value = payload.accessToken
    writeStoredToken(payload.accessToken)
  }

  function clearSession() {
    user.value = null
    accessToken.value = null
    writeStoredToken(null)
  }

  async function registerAccount(payload: RegisterPayload) {
    const response = await registerUser(payload)
    setSession(response)
    return response
  }

  async function loginAccount(payload: LoginPayload) {
    const response = await loginUser(payload)
    setSession(response)
    return response
  }

  async function restoreSession() {
    const token = accessToken.value ?? readStoredToken()
    if (!token) return false

    accessToken.value = token

    try {
      const { user: profile } = await fetchMe(token)
      user.value = profile
      return true
    } catch {
      clearSession()
      return false
    }
  }

  function logout() {
    clearSession()
  }

  function setRole(role: UserRole) {
    if (!user.value) return
    user.value = { ...user.value, role }
  }

  function updateProfile(profile: User) {
    user.value = profile
  }

  async function uploadAvatar(file: File) {
    const token = accessToken.value ?? readStoredToken()
    if (!token) {
      throw new Error('Необходимо войти в аккаунт')
    }

    const { user: updated } = await uploadUserAvatar(file, token)
    user.value = updated
    return updated
  }

  return {
    user,
    accessToken,
    isLoggedIn,
    cabinetPath,
    userAvatar,
    registerAccount,
    loginAccount,
    restoreSession,
    uploadAvatar,
    updateProfile,
    logout,
    setRole,
  }
}
