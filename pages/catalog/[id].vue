<script setup lang="ts">
import { ArrowLeft, Eye, Heart, Share2 } from '@lucide/vue'
import { DEFAULT_AVATAR } from '~/composables/useUser'
import { getApiErrorMessage } from '~/api/client'
import {
  getApiPhotographerWorksCount,
  getMockPhotographerWorksCount,
  loadCatalogWork,
} from '~/api/catalog-work'
import { likeWork, recordWorkView, unlikeWork } from '~/api/works'
import FullSizePreview from '~/components/Modals/FullSizePreview.vue'
import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
} from '~/components/ui/carousel'

const { $toast } = useNuxtApp()

const route = useRoute()
const { accessToken } = useUser()

const workId = computed(() => String(route.params.id))

const { data: work, status, refresh } = await useAsyncData(
  () => `catalog-work:${workId.value}:${accessToken.value ?? ''}`,
  () => loadCatalogWork(workId.value, accessToken.value),
  { watch: [workId, accessToken] },
)

useHead({
  title: computed(() => work.value?.title ?? 'Работа'),
})

const { data: apiPhotographerWorksCount } = await useAsyncData(
  () =>
    work.value?.source === 'api'
      ? `catalog-work-count:${work.value.photographerId}`
      : 'catalog-work-count:none',
  async () => {
    if (!work.value || work.value.source !== 'api') return 0
    return getApiPhotographerWorksCount(work.value.photographerId)
  },
  { watch: [work] },
)

const photographerWorksCount = computed(() => {
  if (!work.value) return 0
  if (work.value.source === 'mock') {
    return getMockPhotographerWorksCount(work.value.photographerId)
  }
  return apiPhotographerWorksCount.value ?? 0
})

function throwIfWorkNotFound() {
  if (status.value === 'pending') return
  if (status.value === 'success' && !work.value) {
    throw createError({ statusCode: 404, message: 'Работа не найдена' })
  }
}

watch([work, status], throwIfWorkNotFound)

onMounted(async () => {
  if (!work.value && workId.value) {
    await refresh()
  }
  throwIfWorkNotFound()
})

const isLiked = ref(false)
const likesCount = ref(0)
const viewsCount = ref(0)
const likeLoading = ref(false)
const viewRecordedForWorkId = ref<string | null>(null)

function syncLikeStateFromWork() {
  const value = work.value
  if (!value) return

  likesCount.value = value.likes
  viewsCount.value = value.views
  isLiked.value = value.source === 'api' ? value.likedByMe : false
}

watch(work, syncLikeStateFromWork, { immediate: true })

async function registerWorkView() {
  const value = work.value
  const token = accessToken.value

  if (!value || value.source !== 'api' || !token) return
  if (viewRecordedForWorkId.value === value.id) return

  viewRecordedForWorkId.value = value.id

  try {
    const response = await recordWorkView(value.id, token)
    viewsCount.value = response.viewsCount
  } catch {
    viewRecordedForWorkId.value = null
  }
}

watch(
  [work, accessToken],
  () => {
    registerWorkView()
  },
  { immediate: true },
)

watch(workId, () => {
  viewRecordedForWorkId.value = null
  previewOpen.value = false
})

const photographerProfileTo = computed(() =>
  work.value
    ? { path: '/catalog/photographer', query: { id: work.value.photographerId } }
    : '/catalog',
)

const workImages = computed(() => work.value?.images ?? [])
const hasMultipleImages = computed(() => workImages.value.length > 1)

const previewOpen = ref(false)
const previewIndex = ref(0)

const previewScreenshots = computed(() =>
  workImages.value.map((src) => ({ src })),
)

function openPreview(index = 0) {
  previewIndex.value = index
  previewOpen.value = true
}

async function toggleLike() {
  if (!work.value || likeLoading.value) return

  if (work.value.source === 'mock') {
    isLiked.value = !isLiked.value
    likesCount.value += isLiked.value ? 1 : -1
    return
  }

  const token = accessToken.value
  if (!token) {
    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  likeLoading.value = true

  try {
    const response = isLiked.value
      ? await unlikeWork(work.value.id, token)
      : await likeWork(work.value.id, token)

    likesCount.value = response.likesCount
    isLiked.value = response.liked
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось обновить лайк — попробуйте позже')
  } finally {
    likeLoading.value = false
  }
}

async function shareWork() {
  if (!work.value || !import.meta.client) return

  const url = window.location.href
  const payload = { title: work.value.title, url }

  if (navigator.share) {
    try {
      await navigator.share(payload)
      return
    } catch {}
  }

  await navigator.clipboard.writeText(url)
  $toast.success('Ссылка скопирована', 'Отправьте её в мессенджер или соцсеть')
}
</script>

<template>
  <div v-if="work" class="work-page overflow-x-hidden">
    <div class="site-container mx-auto px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
      <NuxtLink
        to="/catalog"
        class="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-brand-mint"
      >
        <ArrowLeft class="h-4 w-4" />
        Назад в каталог
      </NuxtLink>

      <div class="mt-6 max-md:-mx-4 max-md:w-[calc(100%+2rem)] md:mx-0 md:w-full">
        <Carousel
          v-if="hasMultipleImages"
          class="w-full"
          :opts="{ loop: true, align: 'center' }"
        >
          <CarouselContent class="-ml-0">
            <CarouselItem
              v-for="(photo, index) in workImages"
              :key="`${work.id}-${index}`"
              class="basis-full pl-0"
            >
              <button
                type="button"
                class="relative block h-[clamp(40rem,58vh,44rem)] w-full cursor-zoom-in overflow-hidden rounded-xl bg-neutral-900 max-md:rounded-none max-md:h-auto md:rounded-2xl"
                :aria-label="`Открыть фото ${index + 1} в полном размере`"
                @click="openPreview(index)"
              >
                <img
                  :src="photo"
                  :alt="`${work.title} — фото ${index + 1}`"
                  class="h-full w-full object-cover"
                  draggable="false"
                >
              </button>
            </CarouselItem>
          </CarouselContent>
          <CarouselIndicators
            active-indicator-class="!bg-black !ring-neutral-700/70 !ring-offset-white"
            inactive-indicator-class="!bg-neutral-300 !ring-neutral-500/80"
          />
        </Carousel>

        <button
          v-else
          type="button"
          class="relative block h-[clamp(40rem,58vh,44rem)] w-full cursor-zoom-in overflow-hidden rounded-xl bg-neutral-900 max-md:rounded-none max-md:h-auto md:rounded-2xl"
          :aria-label="`Открыть «${work.title}» в полном размере`"
          @click="openPreview(0)"
        >
          <img
            :src="work.image"
            :alt="work.title"
            class="h-full w-full object-cover"
            draggable="false"
          >
        </button>
      </div>

      <h1 class="mt-4 text-xl font-bold leading-snug text-brand-text md:text-2xl md:leading-tight">
        {{ work.title }}
      </h1>

      <div class="mt-4 flex flex-col gap-4 border-b border-neutral-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <NuxtLink :to="photographerProfileTo" class="shrink-0">
            <img
              :src="work.photographerAvatar || DEFAULT_AVATAR"
              :alt="work.photographer"
              class="h-10 w-10 rounded-full object-cover ring-1 ring-neutral-200 md:h-11 md:w-11"
            >
          </NuxtLink>

          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="photographerProfileTo"
              class="block truncate text-base font-semibold text-brand-text transition hover:text-brand-mint-dark leading-[1.15]"
            >
              {{ work.photographer }}
            </NuxtLink>
            <p class="text-sm text-neutral-500">
              {{ photographerWorksCount }}
              {{ photographerWorksCount === 1 ? 'работа' : photographerWorksCount < 5 ? 'работы' : 'работ' }}
              в портфолио
            </p>
          </div>

          <NuxtLink
            :to="photographerProfileTo"
            class="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-mint hover:text-neutral-900"
          >
            Профиль
          </NuxtLink>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-brand-text transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            :class="isLiked ? '!border-brand-mint/10 !bg-brand-mint/15 !text-brand-mint-dark' : ''"
            :aria-pressed="isLiked"
            :aria-label="isLiked ? 'Убрать лайк' : 'Поставить лайк'"
            :disabled="likeLoading"
            @click="toggleLike"
          >
            <Heart class="h-5 w-5" :class="isLiked ? 'fill-current text-brand-mint-dark' : ''" />
            <span>{{ likesCount.toLocaleString('ru-RU') }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-brand-text transition hover:bg-neutral-200"
            @click="shareWork"
          >
            <Share2 class="h-5 w-5" />
            <span>Поделиться</span>
          </button>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-brand-mint/30 bg-brand-mint/10 px-3 py-1 text-xs font-semibold text-brand-mint-dark">
          {{ work.category }}
        </span>
        <span class="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
          {{ work.year }}
        </span>
        <span
          v-for="tag in work.tags"
          :key="tag"
          class="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-500"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="mt-6 flex flex-wrap gap-6 text-sm text-neutral-500">
        <span class="inline-flex items-center gap-1.5">
          <Eye class="h-4 w-4 shrink-0 text-brand-mint" />
          {{ viewsCount.toLocaleString('ru-RU') }} просмотр(ов)
        </span>
        <span>Опубликовано {{ work.publishedAt }}</span>
      </div>

      <p class="mt-8 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-neutral-600">
        {{ work.description }}
      </p>
    </div>

    <FullSizePreview
      v-model="previewOpen"
      v-model:index="previewIndex"
      :screenshots="previewScreenshots"
    />
  </div>
</template>
