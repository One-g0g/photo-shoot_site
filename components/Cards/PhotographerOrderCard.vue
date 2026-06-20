<script setup lang="ts">
import { MapPin, Phone, User } from '@lucide/vue'
import type { PhotographerOrder } from '~/api/orders'

defineProps<{
  order: PhotographerOrder
}>()

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <article class="soft-card flex h-full flex-col p-5 sm:p-6">
    <div class="flex items-start justify-between gap-3">
      <span class="status-badge status-badge-wait">
        Быстрый поиск
      </span>
      <time
        :datetime="order.createdAt"
        class="shrink-0 text-[13px] leading-snug text-neutral-400"
      >
        {{ formatOrderDate(order.createdAt) }}
      </time>
    </div>

    <p class="mt-4 text-xl font-bold tracking-tight text-brand-text">
      {{ order.category }}
    </p>

    <div class="mt-4 space-y-2.5 text-sm">
      <p class="flex items-center gap-2 text-neutral-600">
        <User class="h-4 w-4 shrink-0 text-neutral-400" :stroke-width="2" />
        {{ order.clientName }}
      </p>
      <p class="flex items-center gap-2 text-neutral-600">
        <MapPin class="h-4 w-4 shrink-0 text-neutral-400" :stroke-width="2" />
        {{ order.city }}
      </p>
      <p class="flex items-center gap-2 font-medium tabular-nums text-neutral-700">
        <Phone class="h-4 w-4 shrink-0 text-neutral-400" :stroke-width="2" />
        {{ order.phone }}
      </p>
    </div>
  </article>
</template>
