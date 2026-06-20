<script setup lang="ts">
const route = useRoute()

const isHomePage = computed(() => route.path === '/')
</script>

<template>
  <div class="flex min-h-screen flex-col bg-brand-bg text-brand-text">
    <SiteHeader class="hidden md:block" />
    <main
      class="flex-1"
      :class="isHomePage ? 'pt-0 pb-24 md:pb-0' : 'pt-0 pb-24 md:pt-[4.75rem] md:pb-0'"
    >
      <slot />
    </main>
    <MobileBottomNav />
    <Sidebar />
    <SiteFooter class="mt-auto" />
  </div>
</template>
