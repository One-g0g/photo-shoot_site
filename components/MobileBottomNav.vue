<script setup lang="ts">
import { Camera, Grid3X3, House, Info, LogIn, Plus, X } from '@lucide/vue'

const route = useRoute()
const { isLoggedIn } = useUser()
const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar()

const centerItem = computed(() => {
  if (!isLoggedIn.value) {
    return { to: '/login', label: 'Вход', icon: LogIn }
  }

  return null
})

function isActive(path: string) {
  if (path === '/') return route.path === '/' && !route.hash
  return route.path.startsWith(path)
}

function isHashActive(hash: string) {
  return route.path === '/' && route.hash === hash
}
</script>

<template>
  <nav class="mobile-bottom-nav md:!hidden">
    <NuxtLink to="/" class="mobile-nav-item" :class="{ 'mobile-nav-item-active': isActive('/') }">
      <House class="h-5 w-5" />
      <span>Главная</span>
    </NuxtLink>

    <NuxtLink to="/catalog" class="mobile-nav-item" :class="{ 'mobile-nav-item-active': isActive('/catalog') }">
      <Grid3X3 class="h-5 w-5" />
      <span>Каталог</span>
    </NuxtLink>

    <button
      v-if="isLoggedIn"
      type="button"
      class="mobile-nav-item"
      :aria-expanded="sidebarOpen"
      aria-label="Меню"
      @click="toggleSidebar"
    >
      <div class="absolute left-1/2 top-[-26px] -translate-x-1/2 rounded-full bg-white p-[6px]">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-[50%] rounded-t-full border border-[rgba(0,0,0,0.08)] border-b-0 -z-10" />
        <div
          class="mobile-nav-center"
          :class="{ 'mobile-nav-center-close': sidebarOpen }"
        >
          <Plus v-if="!sidebarOpen" class="h-5 w-5 text-white" :stroke-width="2.5" />
          <X v-else class="h-5 w-5 text-neutral-700" :stroke-width="2.5" />
        </div>
      </div>

      <span>{{ sidebarOpen ? 'Закрыть' : 'Меню' }}</span>
    </button>

    <NuxtLink
      v-else-if="centerItem"
      :to="centerItem.to"
      class="mobile-nav-item"
      :class="{ 'mobile-nav-item-active': isActive(centerItem.to) }"
    >
      <div class="absolute left-1/2 top-[-26px] -translate-x-1/2 rounded-full bg-white p-[6px]">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-[50%] rounded-t-full border border-[rgba(0,0,0,0.08)] border-b-0 -z-10" />
        <div class="mobile-nav-center">
          <component :is="centerItem.icon" class="h-5 w-5 text-white" />
        </div>
      </div>

      <span>{{ centerItem.label }}</span>
    </NuxtLink>

    <NuxtLink to="/#about" class="mobile-nav-item" :class="{ 'mobile-nav-item-active': isHashActive('#about') }">
      <Info class="h-5 w-5" />
      <span>О нас</span>
    </NuxtLink>

    <NuxtLink to="/#genres" class="mobile-nav-item" :class="{ 'mobile-nav-item-active': isHashActive('#genres') }">
      <Camera class="h-5 w-5" />
      <span>Жанры</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 101;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
  gap: 0.25rem;
  padding: 0rem 0.5rem calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  color: #7c7c7c;
  font-size: 0.7rem;
  font-weight: 500;
  padding-top: 8px;
}

.mobile-nav-item-active {
  color: #1a1a1a;
}

.mobile-nav-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 46px;
  aspect-ratio: 1/1;
  position: relative;
  border-radius: 9999px;
  background: #20d489;
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #fff;
  font-size: 0.67rem;
  font-weight: 700;
}

.mobile-nav-center-close {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.12);
  color: #404040;
}
</style>
