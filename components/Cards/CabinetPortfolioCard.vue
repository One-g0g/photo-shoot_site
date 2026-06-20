<script setup lang="ts">
import { Eye, Loader2, Pencil, Trash2 } from '@lucide/vue'

export type CabinetWorkCardData = {
  id: string
  title: string
  category: string
  year: number
  image: string
  subtitle?: string
}

defineProps<{
  work: CabinetWorkCardData
  deleting?: boolean
}>()

const emit = defineEmits<{
  edit: []
  open: []
  delete: []
}>()
</script>

<template>
  <article
    class="group relative block w-full min-h-[30rem] overflow-hidden rounded-[2rem] bg-neutral-900 transition-all duration-500 md:min-h-[28rem]"
  >
    <img
      :src="work.image"
      :alt="work.title"
      draggable="false"
      class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 select-none"
    >
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10 md:from-black/80 md:via-black/45" />

    <div class="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2 md:left-6 md:top-6">
      <span class="rounded-full bg-white/20 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {{ work.year }}
      </span>
      <span class="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
        {{ work.category }}
      </span>
    </div>

    <div class="absolute inset-x-0 bottom-0 z-10 p-4 md:p-6">
      <div class="absolute inset-0 z-0 overflow-hidden rounded-b-4xl md:hidden">
        <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/80 backdrop-blur-[2px]" />
      </div>

      <p
        v-if="work.subtitle"
        class="relative z-[1] text-xs font-semibold text-white/80 md:text-sm"
      >
        {{ work.subtitle }}
      </p>
      <p class="relative z-[1] mt-2 text-3xl font-black tracking-tight text-white md:text-[2.3rem]">
        {{ work.title }}
      </p>

      <div class="relative z-[1] mt-5 flex items-center gap-3">
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/95 text-neutral-800 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Редактировать"
          @click="emit('edit')"
        >
          <Pencil class="h-4 w-4" :stroke-width="2" />
        </button>

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mint text-white shadow-lg transition hover:scale-105 hover:bg-brand-mint-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/60"
          aria-label="Открыть"
          @click="emit('open')"
        >
          <Eye class="h-4 w-4" :stroke-width="2" />
        </button>

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:scale-105 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="deleting"
          aria-label="Удалить"
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
      </div>
    </div>
  </article>
</template>
