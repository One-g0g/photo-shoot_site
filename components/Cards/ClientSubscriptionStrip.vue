<script setup lang="ts">
import type { Subscription } from '~/api/subscriptions'
import { resolveUserAvatar } from '~/composables/useUser'

defineProps<{
  subscription: Subscription
  loading?: boolean
}>()

const emit = defineEmits<{
  unsubscribe: []
}>()

function profilePath(photographerId: string) {
  return {
    path: '/catalog/photographer',
    query: { id: photographerId },
  }
}
</script>

<template>
  <article
    class="group rounded-2xl border border-neutral-200/70 bg-white px-5 py-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] sm:px-6 sm:py-5"
  >
    <div class="flex items-start justify-between gap-4">
      <NuxtLink
        :to="profilePath(subscription.photographer.id)"
        class="flex min-w-0 items-center gap-3 transition hover:opacity-85"
      >
        <img
          :src="resolveUserAvatar(subscription.photographer.avatar)"
          :alt="subscription.photographer.name"
          class="h-11 w-11 shrink-0 rounded-full border border-neutral-100 bg-neutral-50 object-cover shadow-sm"
        >
        <p class="truncate text-lg font-bold tracking-tight text-brand-text">
          {{ subscription.photographer.name }}
        </p>
      </NuxtLink>

      <button
        type="button"
        class="btn-main-outline shrink-0 self-start px-4 py-2 text-xs disabled:opacity-60"
        :disabled="loading"
        @click="emit('unsubscribe')"
      >
        {{ loading ? '…' : 'Отписаться' }}
      </button>
    </div>
  </article>
</template>
