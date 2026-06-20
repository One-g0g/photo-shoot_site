<script setup lang="ts">
import { Loader2, Trash2 } from '@lucide/vue'
import type { Order } from '~/api/orders'

defineProps<{
  order: Order
  deleting?: boolean
}>()

const emit = defineEmits<{
  delete: []
}>()

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function orderStatusLabel(status: Order['status']) {
  return status === 'open' ? 'В поиске' : 'Закрыта'
}
</script>

<template>
  <article
    class="group flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] sm:gap-4 sm:px-5 sm:py-4"
    :class="
      order.status === 'open'
        ? 'border-brand-mint/15 bg-gradient-to-br from-brand-mint/[0.06] via-white to-white hover:border-brand-mint/25'
        : 'border-neutral-200/70 bg-white hover:border-neutral-300'
    "
  >
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <p class="text-lg font-bold tracking-tight text-brand-text">
          {{ order.category }}
        </p>
        <span
          class="status-badge"
          :class="order.status === 'open' ? 'status-badge-wait' : 'status-badge-ok'"
        >
          {{ orderStatusLabel(order.status) }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm">
        <span class="text-neutral-500">{{ order.city }}</span>
        <span class="hidden h-1 w-1 rounded-full bg-neutral-300 sm:inline-block" />
        <span class="font-medium tabular-nums text-neutral-700">{{ order.phone }}</span>
      </div>

      <time
        :datetime="order.createdAt"
        class="block text-[13px] leading-snug text-neutral-400"
      >
        {{ formatOrderDate(order.createdAt) }}
      </time>
    </div>

    <button
      type="button"
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 shadow-sm transition hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Удалить заявку"
      :disabled="deleting"
      @click="emit('delete')"
    >
      <Loader2
        v-if="deleting"
        class="h-4 w-4 animate-spin"
        :stroke-width="2"
      />
      <Trash2
        v-else
        class="h-4 w-4"
        :stroke-width="2"
      />
    </button>
  </article>
</template>
