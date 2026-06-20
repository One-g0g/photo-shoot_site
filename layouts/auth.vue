<template>
  <div class="flex min-h-screen min-h-dvh flex-col bg-brand-bg text-brand-text">
    <SiteHeader class="hidden md:block" />
    <main class="flex flex-1 flex-col pt-0 pb-24 max-md:pb-12 md:pb-0">
      <slot />
    </main>
    <MobileBottomNav />
  </div>
</template>
