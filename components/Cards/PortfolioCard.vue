<script setup lang="ts">
import { Heart } from '@lucide/vue'

export type PortfolioCardWork = {
  id: string
  title: string
  image: string
  images?: string[]
  category: string
  year: number
  photographer: string
  likesCount?: number
  likedByMe?: boolean
  source?: 'api' | 'mock'
}

const props = withDefaults(
  defineProps<{
    work: PortfolioCardWork
    isLiked?: boolean
    likesCount?: number
    likeLoading?: boolean
    showLike?: boolean
  }>(),
  {
    isLiked: false,
    likesCount: 0,
    likeLoading: false,
    showLike: true,
  },
)

const displayLikesCount = computed(() => props.likesCount ?? props.work.likesCount ?? 0)

const cardImages = computed(() => {
  const list = props.work.images?.filter(Boolean) ?? []
  if (list.length) return list
  return props.work.image ? [props.work.image] : []
})

const hasGallery = computed(() => cardImages.value.length > 1)

const activeIndex = ref(0)
const isPaused = ref(false)
let slideTimer: ReturnType<typeof setTimeout> | null = null

function clearSlideTimer() {
  if (slideTimer) {
    clearTimeout(slideTimer)
    slideTimer = null
  }
}

function randomSlideDelay() {
  return 2000 + Math.random() * 3000
}

function goToSlide(index: number) {
  if (!hasGallery.value) return
  activeIndex.value = index % cardImages.value.length
}

function goToNextSlide() {
  goToSlide(activeIndex.value + 1)
}

function scheduleNextSlide() {
  clearSlideTimer()
  if (!import.meta.client || !hasGallery.value || isPaused.value) return

  slideTimer = setTimeout(() => {
    goToNextSlide()
    scheduleNextSlide()
  }, randomSlideDelay())
}

function pauseGallery() {
  isPaused.value = true
  clearSlideTimer()
}

function resumeGallery() {
  isPaused.value = false
  scheduleNextSlide()
}

watch(hasGallery, (enabled) => {
  if (enabled) {
    activeIndex.value = 0
    scheduleNextSlide()
  } else {
    clearSlideTimer()
  }
}, { immediate: true })

onUnmounted(clearSlideTimer)

const emit = defineEmits<{
  toggleLike: [id: string, event: Event]
}>()

function onToggleLike(id: string, event: Event) {
  emit('toggleLike', id, event)
}
</script>

<template>
  <NuxtLink
    :to="`/catalog/${work.id}`"
    class="group block w-full break-inside-avoid"
  >
    <article
      class="relative min-h-[30rem] overflow-hidden rounded-[2rem] bg-neutral-900 transition-all duration-500 md:min-h-[28rem]"
      @mouseenter="pauseGallery"
      @mouseleave="resumeGallery"
    >
      <div class="absolute inset-0 z-0 overflow-hidden transition duration-700 group-hover:scale-105">
        <template v-if="hasGallery">
          <img
            v-for="(photo, index) in cardImages"
            :key="`${work.id}-${index}`"
            :src="photo"
            loading="lazy"
            :alt="`${work.title} — фото ${index + 1}`"
            draggable="false"
            class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out select-none"
            :class="index === activeIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0'"
          >
        </template>
        <img
          v-else
          :src="work.image"
          loading="lazy"
          :alt="work.title"
          draggable="false"
          class="absolute inset-0 h-full w-full object-cover select-none"
        >
      </div>

      <div class="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/35 to-black/10 md:from-black/80 md:via-black/45" />

      <div
        v-if="hasGallery"
        class="absolute bottom-6 right-6 z-20 hidden items-center gap-1.5 sm:flex md:bottom-7 md:right-7"
        aria-hidden="true"
      >
        <span
          v-for="(_, index) in cardImages"
          :key="index"
          class="rounded-full transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.28)]"
          :class="index === activeIndex
            ? 'size-2.5 bg-neutral-100 ring-2 ring-neutral-400/55 ring-offset-1 ring-offset-black/30'
            : 'size-1.5 bg-neutral-100/90 ring-1 ring-neutral-300/70'"
        />
      </div>

      <div class="absolute left-4 top-4 z-10 flex items-center gap-2 md:left-6 md:top-6">
        <span class="rounded-full bg-white/20 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {{ work.year }}
        </span>
        <span class="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {{ work.category }}
        </span>
      </div>

      <button
        v-if="showLike"
        type="button"
        class="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/35 bg-black/25 px-3 py-2 text-white backdrop-blur-sm transition md:right-6 md:top-6 disabled:opacity-60"
        :class="isLiked ? 'border-brand-mint bg-brand-mint text-white' : ''"
        :aria-pressed="isLiked"
        :aria-label="isLiked ? 'Убрать лайк' : 'Поставить лайк'"
        :disabled="likeLoading"
        @click="onToggleLike(work.id, $event)"
      >
        <Heart class="h-4 w-4 shrink-0" :class="isLiked ? 'fill-current' : ''" />
        <span class="text-xs font-semibold tabular-nums">
          {{ displayLikesCount.toLocaleString('ru-RU') }}
        </span>
      </button>

      <div class="absolute inset-x-0 bottom-0 z-10 p-4 md:p-6">
        <div class="absolute inset-0 z-0 overflow-hidden rounded-b-4xl md:hidden">
          <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/80 backdrop-blur-[2px]" />
        </div>

        <p class="relative z-[1] text-xs font-semibold text-white/80 md:text-sm">
          {{ work.photographer }}
        </p>
        <p class="relative z-[1] mt-2 text-4xl font-black tracking-tight text-white md:text-[2.3rem]">
          {{ work.title }}
        </p>

        <div class="relative z-[1] mt-5 flex items-center gap-2 md:hidden">
          <span class="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 group-hover:bg-brand-mint group-hover:text-white">
            Смотреть
          </span>
        </div>

        <span
          class="relative z-[1] mt-5 hidden items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-all duration-300 group-hover:bg-brand-mint group-hover:text-white md:inline-flex"
        >
          Смотреть
        </span>
      </div>
    </article>
  </NuxtLink>
</template>
