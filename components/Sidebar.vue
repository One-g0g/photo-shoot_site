<script setup lang="ts">
import type { Component } from 'vue'
import { Grid3X3, ImagePlus, PlusCircle } from '@lucide/vue'
import type { UserRole } from '~/composables/useUser'
import ChangeAvatarModal from '~/components/Modals/ChangeAvatarModal.vue'
import HelpSupportModal from '~/components/Modals/HelpSupportModal.vue'
import ProfileSettingsModal from '~/components/Modals/ProfileSettingsModal.vue'
import AddWorkModal from '~/components/Modals/AddWorkModal.vue'
import type { Work } from '~/api/works'

const route = useRoute()
const { isOpen, close } = useSidebar()
const { user, isLoggedIn, setRole, logout } = useUser()
const { isOpen: addWorkModalOpen, openAddWorkModal, notifyWorkCreated } = useAddWorkModal()

const avatarModalOpen = ref(false)
const settingsModalOpen = ref(false)
const helpModalOpen = ref(false)

const cabinetPath = computed(() =>
  user.value?.role === 'photographer' ? '/cabinet/photographer' : '/cabinet/client',
)

const navLinks = computed(() => [
  { label: 'Профиль', to: cabinetPath.value },
])

const actionLink = computed<{ label: string; to: string; icon: Component; isButton: boolean } | null>(() => {
  if (!user.value) return null

  if (user.value.role === 'photographer') {
    return { label: 'Добавить работу', to: cabinetPath.value, icon: PlusCircle as Component, isButton: true }
  }

  return { label: 'Каталог работ', to: '/catalog', icon: Grid3X3 as Component, isButton: false }
})

const roleItems = [
  { name: 'Клиент', icon: null },
  { name: 'Фотограф', icon: null },
]

const activeRoleIndex = computed(() => (user.value?.role === 'client' ? 0 : 1))

const menuItems = computed(() => {
  const items: Array<
    | { type: 'button'; label: string; icon?: Component; action: () => void }
    | { type: 'link'; label: string; to: string; icon?: Component }
  > = [
    {
      type: 'button',
      label: 'Изменить аватар',
      icon: ImagePlus as Component,
      action: () => openAvatarModal(),
    },
    ...navLinks.value.map((link) => ({
      type: 'link' as const,
      label: link.label,
      to: link.to,
    })),
    {
      type: 'button',
      label: 'Настройки',
      action: () => openSettingsModal(),
    },
    {
      type: 'button',
      label: 'Помощь',
      action: () => openHelpModal(),
    },
  ]

  if (actionLink.value) {
    if (actionLink.value.isButton) {
      items.push({
        type: 'button',
        label: actionLink.value.label,
        icon: actionLink.value.icon,
        action: () => openAddWorkModalFlow(),
      })
    } else {
      items.push({
        type: 'link',
        label: actionLink.value.label,
        to: actionLink.value.to,
        icon: actionLink.value.icon,
      })
    }
  }

  items.push({
    type: 'button',
    label: 'Выйти',
    action: () => handleLogout(),
  })

  return items
})

function onRoleIndexChange(index: number) {
  switchRole(index === 0 ? 'client' : 'photographer')
}

async function switchRole(role: UserRole) {
  setRole(role)
  const path = role === 'photographer' ? '/cabinet/photographer' : '/cabinet/client'
  if (route.path !== path) {
    await navigateTo(path)
  }
  close()
}

function openAvatarModal() {
  avatarModalOpen.value = true
  close()
}

function openSettingsModal() {
  settingsModalOpen.value = true
  close()
}

function openHelpModal() {
  helpModalOpen.value = true
  close()
}

function openAddWorkModalFlow() {
  openAddWorkModal()
  close()
}

async function handleLogout() {
  logout()
  await navigateTo('/')
  close()
}

function onWorkCreated(work: Work) {
  notifyWorkCreated(work)
}

watch(() => route.fullPath, () => {
  close()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && isLoggedIn && user"
      class="sidebar-root md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Меню аккаунта"
    >
      <div class="sidebar-panel">
        <div class="sidebar-scroll" data-scroll-lock-scroll>
          <header class="sidebar-header">
            <NuxtLink
              to="/"
              class="sidebar-logo flex items-center gap-2.5"
            >
              <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Photo Shoot logo" class="h-full w-full object-cover">
              </span>
              <span class="text-xl font-extrabold tracking-tight">
                <span class="text-brand-mint">PHOTO</span>
                <span class="text-brand-text"> SHOOT</span>
              </span>
            </NuxtLink>
            <p class="mt-2 max-w-xs text-sm text-neutral-500">
              Портфолио фотографов по категориям — находи авторов и сохраняй в избранное
            </p>
          </header>

          <div class="sidebar-divider" />

          <div class="sidebar-switcher">
            <SectionSwitcher
              :items="roleItems"
              :active-item="activeRoleIndex"
              full-width
              @update:active-item="onRoleIndexChange"
            />
          </div>

          <nav class="sidebar-nav">
            <template v-for="item in menuItems" :key="item.label">
              <button
                v-if="item.type === 'button'"
                type="button"
                class="sidebar-link"
                @click="item.action()"
              >
                <component :is="item.icon" v-if="item.icon" class="sidebar-link-icon" :size="22" :stroke-width="2" />
                {{ item.label }}
              </button>

              <NuxtLink
                v-else
                :to="item.to"
                class="sidebar-link"
              >
                <component :is="item.icon" v-if="item.icon" class="sidebar-link-icon" :size="22" :stroke-width="2" />
                {{ item.label }}
              </NuxtLink>
            </template>
          </nav>
        </div>
      </div>
    </div>
  </Teleport>

  <ChangeAvatarModal v-if="isLoggedIn" v-model:open="avatarModalOpen" />
  <ProfileSettingsModal v-if="isLoggedIn" v-model:open="settingsModalOpen" />
  <HelpSupportModal v-if="isLoggedIn" v-model:open="helpModalOpen" />
  <AddWorkModal
    v-if="isLoggedIn && user?.role === 'photographer'"
    v-model:open="addWorkModalOpen"
    @created="onWorkCreated"
  />
</template>

<style scoped>
@reference "../assets/globals.css";

.sidebar-root {
  @apply fixed inset-0 z-[100] overflow-hidden overscroll-none;
}

.sidebar-panel {
  @apply flex h-full flex-col bg-brand-bg;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 5.5rem);
}

.sidebar-scroll {
  @apply flex-1 overflow-y-auto overscroll-contain px-5 pt-8;
  -webkit-overflow-scrolling: touch;
}

.sidebar-header {
  @apply pb-6;
}

.sidebar-divider {
  @apply h-px bg-neutral-200/80;
}

.sidebar-switcher {
  @apply py-5;
  touch-action: manipulation;
}

.sidebar-nav {
  @apply flex flex-col gap-1 py-1;
}

.sidebar-link {
  @apply flex min-h-[44px] items-center gap-3 py-2 text-left text-2xl font-bold tracking-tight leading-[1] text-brand-text transition-colors duration-150;
  touch-action: manipulation;
}

.sidebar-link:active {
  @apply text-brand-mint-dark;
}

.sidebar-link-icon {
  @apply shrink-0 text-brand-mint;
}

</style>
