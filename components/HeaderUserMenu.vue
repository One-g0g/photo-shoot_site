<script setup lang="ts">
import type { Component } from 'vue'
import { CircleHelp, Grid3X3, ImagePlus, LogOut, PlusCircle, Settings, User } from '@lucide/vue'
import type { User as AppUser, UserRole } from '~/composables/useUser'

const props = defineProps<{
  user: AppUser
}>()

const emit = defineEmits<{
  switchRole: [role: UserRole]
  changeAvatar: []
  openSettings: []
  openHelp: []
  addWork: []
  logout: []
  close: []
}>()

const acceptingOrders = ref(true)

const cabinetPath = computed(() =>
  props.user.role === 'photographer' ? '/cabinet/photographer' : '/cabinet/client',
)

const navLinks = computed(() => [
  { label: 'Профиль', to: cabinetPath.value, icon: User as Component },
])

const actionLink = computed<{ label: string; to: string; icon: Component } | null>(() => {
  if (props.user.role === 'photographer') {
    return { label: 'Добавить работу', to: cabinetPath.value, icon: PlusCircle as Component }
  }
  return { label: 'Каталог работ', to: '/catalog', icon: Grid3X3 as Component }
})

const roleItems = [
  { name: 'Клиент', icon: null },
  { name: 'Фотограф', icon: null },
]

const activeRoleIndex = computed(() => (props.user.role === 'client' ? 0 : 1))

function onRoleIndexChange(index: number) {
  emit('switchRole', index === 0 ? 'client' : 'photographer')
}

function onLinkClick() {
  emit('close')
}

function onChangeAvatar(event: MouseEvent) {
  event.stopPropagation()
  emit('changeAvatar')
}

function onAddWork(event: MouseEvent) {
  event.stopPropagation()
  emit('addWork')
}

function onOpenSettings(event: MouseEvent) {
  event.stopPropagation()
  emit('openSettings')
}

function onOpenHelp(event: MouseEvent) {
  event.stopPropagation()
  emit('openHelp')
}
</script>

<template>
  <div class="header-user-dropdown" role="menu" @click.stop @mousedown.stop>
    <div class="menu-block">
      <SectionSwitcher
        :items="roleItems"
        :active-item="activeRoleIndex"
        full-width
        @update:active-item="onRoleIndexChange"
      />
    </div>

    <nav class="menu-block-links menu-block-bordered menu-links">
      <button
        type="button"
        class="menu-link menu-link-with-icon"
        @click="onChangeAvatar"
      >
        <ImagePlus class="menu-link-icon" :size="17" :stroke-width="2" />
        Изменить аватар
      </button>

      <NuxtLink
        v-for="link in navLinks"
        :key="link.label"
        :to="link.to"
        class="menu-link menu-link-with-icon"
        @click="onLinkClick"
      >
        <component :is="link.icon" class="menu-link-icon" :size="17" :stroke-width="2" />
        {{ link.label }}
      </NuxtLink>
      <button type="button" class="menu-link menu-link-with-icon" @click="onOpenSettings">
        <Settings class="menu-link-icon" :size="17" :stroke-width="2" />
        Настройки
      </button>
      <button type="button" class="menu-link menu-link-with-icon" @click="onOpenHelp">
        <CircleHelp class="menu-link-icon" :size="17" :stroke-width="2" />
        Помощь
      </button>

      <button
        v-if="actionLink && user.role === 'photographer'"
        type="button"
        class="menu-link menu-link-with-icon"
        @click="onAddWork"
      >
        <component :is="actionLink.icon" class="menu-link-icon" :size="17" :stroke-width="2" />
        {{ actionLink.label }}
      </button>

      <NuxtLink
        v-else-if="actionLink"
        :to="actionLink.to"
        class="menu-link menu-link-with-icon"
        @click="onLinkClick"
      >
        <component :is="actionLink.icon" class="menu-link-icon" :size="17" :stroke-width="2" />
        {{ actionLink.label }}
      </NuxtLink>

      <button
        type="button"
        class="menu-link menu-link-with-icon !py-2 border-t border-neutral-100"
        @click="emit('logout')"
      >
        <LogOut class="menu-link-icon" :size="17" :stroke-width="2" />
        Выйти
      </button>
    </nav>
  </div>
</template>

<style scoped>
@reference "../assets/globals.css";

.header-user-dropdown {
  @apply absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[16.75rem] overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)];
}

.menu-block {
  @apply px-2 py-2;
}

.menu-block-links {
  @apply px-0 py-2;
}

.menu-block-bordered {
  @apply border-t border-neutral-100;
}

.orders-row {
  @apply flex items-center justify-between gap-2;
}

.orders-label {
  @apply flex items-center gap-1;
}

.orders-hint {
  @apply shrink-0 text-neutral-400;
}

.orders-toggle {
  @apply shrink-0 cursor-pointer;
}

.orders-toggle-track {
  @apply relative block h-[22px] w-10 rounded-full bg-neutral-200 transition-colors duration-200;
}

.orders-toggle-track-on {
  @apply bg-brand-mint;
}

.orders-toggle-thumb {
  @apply absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200;
}

.orders-toggle-track-on .orders-toggle-thumb {
  @apply translate-x-[18px];
}

.menu-links {
  @apply flex flex-col gap-0.5 py-0;
}

.menu-link {
  @apply block w-full px-2.5 py-1.5 text-left text-sm leading-snug text-brand-text transition-colors duration-150;
}

.menu-link:hover {
  @apply bg-brand-mint-light text-brand-mint-dark;
}

.menu-link-with-icon {
  @apply flex items-center gap-2.5;
}

.menu-link-icon {
  @apply shrink-0 text-brand-mint transition-colors duration-150;
}

.menu-link-with-icon:hover .menu-link-icon {
  @apply text-brand-mint-dark;
}
</style>
