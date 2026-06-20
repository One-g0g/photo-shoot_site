<script setup lang="ts">
import { LogOut } from '@lucide/vue'
import ChangeAvatarModal from '~/components/Modals/ChangeAvatarModal.vue'
import HelpSupportModal from '~/components/Modals/HelpSupportModal.vue'
import ProfileSettingsModal from '~/components/Modals/ProfileSettingsModal.vue'
import AddWorkModal from '~/components/Modals/AddWorkModal.vue'
import HeaderUserMenu from '~/components/HeaderUserMenu.vue'
import type { Work } from '~/api/works'

const menuOpen = ref(false)
const userMenuOpen = ref(false)
const avatarModalOpen = ref(false)
const settingsModalOpen = ref(false)
const helpModalOpen = ref(false)
const { isOpen: addWorkModalOpen, openAddWorkModal, notifyWorkCreated } = useAddWorkModal()
const userMenuRef = ref<HTMLElement | null>(null)
const route = useRoute()
const { user, isLoggedIn, userAvatar, logout, setRole } = useUser()

function closeMenu() {
  menuOpen.value = false
}

function closeUserMenu() {
  userMenuOpen.value = false
}

function isActive(path: string) {
  if (path === '/') return route.path === '/' && !route.hash
  return route.path.startsWith(path)
}

function isHashActive(hash: string) {
  return route.path === '/' && route.hash === hash
}

function switchRole(role: 'client' | 'photographer') {
  setRole(role)
  closeMenu()
  closeUserMenu()
  navigateTo(role === 'photographer' ? '/cabinet/photographer' : '/cabinet/client')
}

function handleLogout() {
  logout()
  closeMenu()
  closeUserMenu()
  navigateTo('/')
}

function handleChangeAvatar() {
  if (!user.value) return
  closeMenu()
  closeUserMenu()
  nextTick(() => {
    avatarModalOpen.value = true
  })
}

function handleOpenSettings() {
  if (!user.value) return
  closeMenu()
  closeUserMenu()
  nextTick(() => {
    settingsModalOpen.value = true
  })
}

function handleAddWork() {
  if (!user.value || user.value.role !== 'photographer') return
  closeMenu()
  closeUserMenu()
  nextTick(() => {
    openAddWorkModal()
  })
}

function handleOpenHelp() {
  if (!user.value) return
  closeMenu()
  closeUserMenu()
  nextTick(() => {
    helpModalOpen.value = true
  })
}

function onWorkCreatedFromHeader(work: Work) {
  notifyWorkCreated(work)
}

function onAvatarClick() {
  userMenuOpen.value = !userMenuOpen.value
}

onMounted(() => {
  const onDocumentClick = (event: MouseEvent) => {
    if (!userMenuOpen.value) return
    const target = event.target as Node | null
    if (userMenuRef.value && target && !userMenuRef.value.contains(target)) {
      closeUserMenu()
    }
  }
  document.addEventListener('click', onDocumentClick)
  onUnmounted(() => document.removeEventListener('click', onDocumentClick))
})
</script>

<template>
  <header class="site-header-wrap">
    <div class="header-bar">
      <NuxtLink
        to="/"
        class="logo-text flex shrink-0 items-center gap-2 text-base font-extrabold tracking-tight transition hover:opacity-80 md:text-lg"
        @click="closeMenu"
      >
        <span class="logo-dot flex h-10 w-10 items-center justify-center overflow-hidden ">
          <img src="/logo.png" alt="Photo Shoot logo" class="h-full w-full object-cover">
        </span>
        <span class="hidden sm:inline">
          <span class="text-brand-mint">PHOTO</span>
          <span class="text-brand-text"> SHOOT</span>
        </span>
      </NuxtLink>

      <nav class="hidden items-center gap-0.5 lg:flex absolute left-1/2 -translate-x-1/2">
        <NuxtLink to="/" class="nav-pill" :class="{ 'nav-pill-active': isActive('/') }">
          Главная
        </NuxtLink>
        <NuxtLink to="/catalog" class="nav-pill" :class="{ 'nav-pill-active': isActive('/catalog') }">
          Каталог
        </NuxtLink>
        <NuxtLink to="/#about" class="nav-pill" :class="{ 'nav-pill-active': isHashActive('#about') }">
          Как это работает
        </NuxtLink>
        <NuxtLink to="/#genres" class="nav-pill" :class="{ 'nav-pill-active': isHashActive('#genres') }">
          Категории
        </NuxtLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <div v-if="isLoggedIn && user" ref="userMenuRef" class="relative">
          <button
            type="button"
            class="header-user-trigger"
            :aria-expanded="userMenuOpen"
            aria-haspopup="menu"
            :aria-label="`Меню пользователя ${user.name}`"
            @click.stop="onAvatarClick"
          >
            <div class="header-user-identity min-w-0 text-right">
              <p class="truncate text-sm font-semibold text-brand-text">
                {{ user.name }}
              </p>
              <p class="truncate text-xs text-neutral-500">
                {{ user.email }}
              </p>
            </div>
            <img
              :src="userAvatar"
              :alt="user.name"
              class="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-neutral-200/80 transition hover:ring-brand-mint/50"
            >
          </button>

          <HeaderUserMenu
            v-show="userMenuOpen"
            :user="user"
            @switch-role="switchRole"
            @change-avatar="handleChangeAvatar"
            @open-settings="handleOpenSettings"
            @open-help="handleOpenHelp"
            @add-work="handleAddWork"
            @logout="handleLogout"
            @close="closeUserMenu"
          />
        </div>

        <NuxtLink v-else to="/login" class="btn-main-primary px-4 py-2 text-xs">
          Войти в аккаунт
        </NuxtLink>
      </div>

    </div>

    <div v-if="menuOpen" class="header-mobile-menu lg:hidden">
      <nav class="flex flex-col gap-2 px-4 py-4">
        <NuxtLink to="/" class="nav-pill w-fit" :class="{ 'nav-pill-active': isActive('/') }" @click="closeMenu">Главная</NuxtLink>
        <NuxtLink to="/catalog" class="nav-pill w-fit" :class="{ 'nav-pill-active': isActive('/catalog') }" @click="closeMenu">Каталог</NuxtLink>
        <NuxtLink to="/#about" class="nav-pill w-fit" :class="{ 'nav-pill-active': isHashActive('#about') }" @click="closeMenu">Как это работает</NuxtLink>
        <NuxtLink to="/#genres" class="nav-pill w-fit" :class="{ 'nav-pill-active': isHashActive('#genres') }" @click="closeMenu">Категории</NuxtLink>

        <template v-if="isLoggedIn && user">
          <div class="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3">
            <img
              :src="userAvatar"
              :alt="user.name"
              class="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-neutral-200/80"
            >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-brand-text">{{ user.name }}</p>
              <p class="truncate text-xs text-neutral-500">{{ user.email }}</p>
            </div>
          </div>
          <div class="role-switch mt-2 w-full max-w-xs">
            <button
              type="button"
              class="role-switch-btn flex-1 text-center"
              :class="{ 'role-switch-btn-active': user.role === 'client' }"
              @click="switchRole('client')"
            >
              Клиент
            </button>
            <button
              type="button"
              class="role-switch-btn flex-1 text-center"
              :class="{ 'role-switch-btn-active': user.role === 'photographer' }"
              @click="switchRole('photographer')"
            >
              Фотограф
            </button>
          </div>
          <button type="button" class="header-logout-btn mt-2 w-full justify-start" @click="handleLogout">
            <LogOut :size="16" :stroke-width="2" />
            Выйти
          </button>
        </template>
        <NuxtLink v-else to="/register" class="btn-main-primary mt-3 w-fit px-4 py-2 text-xs" @click="closeMenu">
          Зарегистрироваться
        </NuxtLink>
      </nav>
    </div>

    <ChangeAvatarModal v-if="isLoggedIn" v-model:open="avatarModalOpen" />
    <ProfileSettingsModal v-if="isLoggedIn" v-model:open="settingsModalOpen" />
    <HelpSupportModal v-if="isLoggedIn" v-model:open="helpModalOpen" />
    <AddWorkModal
      v-if="isLoggedIn && user?.role === 'photographer'"
      v-model:open="addWorkModalOpen"
      @created="onWorkCreatedFromHeader"
    />
  </header>
</template>

<style scoped>
@reference "../assets/globals.css";

.site-header-wrap {
  @apply fixed inset-x-0 top-0 z-50 md:px-4 md:pt-3;
}

.header-bar {
  @apply mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-3 border border-neutral-200/80 bg-white px-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] max-md:rounded-none max-md:border-x-0 max-md:border-t-0 md:h-14 md:rounded-full md:bg-white/90 md:px-[6px] md:backdrop-blur-xl;
}

.header-mobile-menu {
  @apply border-b border-neutral-200/80 bg-white md:bg-white/95 md:backdrop-blur-xl;
}

.header-user-trigger {
  @apply flex items-center gap-3 rounded-full py-1 pl-3 pr-1 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40;
}

.header-user-identity {
  @apply max-w-[9rem] xl:max-w-[11rem];
}

.header-logout-btn {
  @apply inline-flex items-center gap-2 rounded-[12px] border border-black/10 bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700 transition-all duration-200;
}

.header-logout-btn:hover {
  @apply border-red-300 bg-red-50 text-red-600;
}

.header-logout-btn svg {
  @apply h-4 w-4 shrink-0;
}

.nav-pill {
  @apply rounded-full px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-brand-text;
}

.nav-pill-active {
  @apply !bg-brand-mint/15 font-medium text-brand-text;
}

.role-switch {
  @apply inline-flex rounded-full border border-neutral-200 bg-neutral-100/90 p-1 shadow-inner;
}

.role-switch-btn {
  @apply rounded-full px-4 py-2 text-xs font-semibold text-neutral-600 transition-all duration-200;
}

.role-switch-btn-active {
  @apply bg-brand-mint text-neutral-900 shadow-md shadow-brand-mint/25;
}
</style>
