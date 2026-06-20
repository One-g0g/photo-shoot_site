<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { Loader2, Menu, Search, X } from '@lucide/vue'
import PortfolioCard from '~/components/Cards/PortfolioCard.vue'
import type { PortfolioCardWork } from '~/components/Cards/PortfolioCard.vue'
import IconInput from '~/components/Inputs/IconInput.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { getApiErrorMessage } from '~/api/client'
import {
  fetchCatalogWorks,
  likeWork,
  resolveWorkImage,
  resolveWorkImages,
  unlikeWork,
} from '~/api/works'
import { portfolioWorks } from '~/data/portfolio-works'

useHead({ title: 'Каталог работ' })

const PAGE_SIZE = 8
const ALL_CITIES_LABEL = 'Все'

const { $toast } = useNuxtApp()

const route = useRoute()
const router = useRouter()
const { categories } = useCategories()
const { accessToken } = useUser()

const query = ref('')
const activeCategory = ref('Все')
const activeCity = ref(ALL_CITIES_LABEL)
const filtersOpen = ref(false)
const citySelectOpen = ref(false)
const filtersRef = ref<HTMLElement | null>(null)

function isCatalogFilterSelectTarget(target: Node | null) {
  if (!target || !(target instanceof Element)) return false

  return Boolean(
    target.closest('[data-slot="select"]')
    || target.closest('[data-slot="select-trigger"]')
    || target.closest('[data-slot="select-content"]')
    || target.closest('[data-slot="select-item"]'),
  )
}

type CatalogCardWork = PortfolioCardWork & {
  likesCount: number
  likedByMe: boolean
  source: 'api' | 'mock'
  city?: string
}

const mockCatalogWorks: CatalogCardWork[] = portfolioWorks.map((work) => ({
  id: work.id,
  title: work.title,
  image: work.image,
  category: work.category,
  year: work.year,
  photographer: work.photographer,
  likesCount: work.likes,
  likedByMe: false,
  source: 'mock',
  city: work.location,
}))

const catalogWorks = ref<CatalogCardWork[]>([])
const catalogLoading = ref(true)

const likeOverrides = ref<
  Record<string, { likesCount: number; likedByMe: boolean }>
>({})

function syncLikeOverridesFromApi(apiItems: CatalogCardWork[]) {
  const next: Record<string, { likesCount: number; likedByMe: boolean }> = {}

  for (const work of apiItems) {
    next[work.id] = {
      likesCount: work.likesCount,
      likedByMe: work.likedByMe,
    }
  }

  likeOverrides.value = next
}

async function loadCatalogWorks() {
  catalogLoading.value = true
  let apiItems: CatalogCardWork[] = []

  try {
    const { works } = await fetchCatalogWorks(accessToken.value)
    apiItems = works.map<CatalogCardWork>((work) => ({
      id: work.id,
      title: work.title,
      image: resolveWorkImage(work.image),
      images: resolveWorkImages(work),
      category: work.category,
      year: work.year,
      photographer: work.photographer.name,
      likesCount: work.likesCount,
      likedByMe: work.likedByMe,
      source: 'api',
      city: work.photographer.city?.trim() || undefined,
    }))
  } catch {
    apiItems = []
  } finally {
    catalogWorks.value = [...apiItems, ...mockCatalogWorks]
    syncLikeOverridesFromApi(apiItems)
    catalogLoading.value = false
    visibleCount.value = PAGE_SIZE
  }
}

watch(accessToken, loadCatalogWorks, { immediate: true })

const availableCities = computed(() => {
  const cities = new Set<string>()

  for (const work of catalogWorks.value) {
    const city = work.city?.trim()
    if (city) {
      cities.add(city)
    }
  }

  return [
    ALL_CITIES_LABEL,
    ...[...cities].sort((a, b) => a.localeCompare(b, 'ru')),
  ]
})

watch(availableCities, (cities) => {
  if (!cities.includes(activeCity.value)) {
    activeCity.value = ALL_CITIES_LABEL
  }
})

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value
}

onMounted(() => {
  const onDocumentPointerDown = (event: PointerEvent) => {
    if (!filtersOpen.value) return

    const target = event.target as Node | null
    if (!target) return

    if (filtersRef.value?.contains(target)) return
    if (citySelectOpen.value || isCatalogFilterSelectTarget(target)) return

    filtersOpen.value = false
  }

  document.addEventListener('pointerdown', onDocumentPointerDown)
  onUnmounted(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
})

function resolveCardLikeState(work: CatalogCardWork) {
  const override = likeOverrides.value[work.id]
  if (override) {
    return override
  }

  return {
    likesCount: work.likesCount,
    likedByMe: work.likedByMe,
  }
}

const likingWorkId = ref<string | null>(null)

function applyCategoryFromQuery() {
  const raw = route.query.category
  const category = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : ''

  activeCategory.value = category && categories.value.includes(category) ? category : 'Все'
}

applyCategoryFromQuery()

watch(() => route.query.category, applyCategoryFromQuery)

function selectCategory(category: string) {
  const nextQuery = { ...route.query }

  if (category === 'Все') {
    delete nextQuery.category
  } else {
    nextQuery.category = category
  }

  router.replace({ path: route.path, query: nextQuery })
}

const filteredWorks = computed(() => {
  const q = query.value.trim().toLowerCase()

  return catalogWorks.value.filter((w) => {
    const okCategory = activeCategory.value === 'Все' || w.category === activeCategory.value
    const okCity =
      activeCity.value === ALL_CITIES_LABEL ||
      w.city?.trim() === activeCity.value
    const okQuery =
      q.length === 0 ||
      w.title.toLowerCase().includes(q) ||
      w.photographer.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      (w.city?.toLowerCase().includes(q) ?? false)

    return okCategory && okCity && okQuery
  })
})

const visibleCount = ref(PAGE_SIZE)
const loadMoreSentinel = ref<HTMLElement | null>(null)

const displayedWorks = computed(() =>
  filteredWorks.value.slice(0, visibleCount.value),
)

const hasMore = computed(
  () => visibleCount.value < filteredWorks.value.length,
)

function loadMore() {
  if (!hasMore.value || catalogLoading.value) return

  visibleCount.value = Math.min(
    visibleCount.value + PAGE_SIZE,
    filteredWorks.value.length,
  )
}

watch([query, activeCategory, activeCity], () => {
  visibleCount.value = PAGE_SIZE
})

useIntersectionObserver(
  loadMoreSentinel,
  ([entry]) => {
    if (entry?.isIntersecting) {
      loadMore()
    }
  },
  { rootMargin: '240px' },
)

async function toggleLike(workId: string, event: Event) {
  event.preventDefault()
  event.stopPropagation()

  const work = catalogWorks.value.find((item) => item.id === workId)
  if (!work || likingWorkId.value) return

  const current = resolveCardLikeState(work)

  if (work.source === 'mock') {
    const likedByMe = !current.likedByMe
    likeOverrides.value[workId] = {
      likesCount: current.likesCount + (likedByMe ? 1 : -1),
      likedByMe,
    }
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

  likingWorkId.value = workId

  try {
    const response = current.likedByMe
      ? await unlikeWork(workId, token)
      : await likeWork(workId, token)

    likeOverrides.value[workId] = {
      likesCount: response.likesCount,
      likedByMe: response.liked,
    }
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось обновить лайк — попробуйте позже')
  } finally {
    likingWorkId.value = null
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="page-header !flex-row !w-full !justify-between">
      <div>
        <h1 class="page-title">Каталог работ</h1>
        <p class="page-subtitle">Примеры работ фотографов по категориям</p>
      </div>

      <div ref="filtersRef" class="catalog-filters">
        <button
          type="button"
          class="catalog-filters-trigger"
          :class="{ 'catalog-filters-trigger--open': filtersOpen }"
          :aria-expanded="filtersOpen"
          aria-haspopup="dialog"
          :aria-label="filtersOpen ? 'Закрыть фильтры' : 'Поиск и фильтры'"
          @click.stop="toggleFilters"
        >
          <X v-if="filtersOpen" :size="20" :stroke-width="2" />
          <Menu v-else :size="20" :stroke-width="2" />
        </button>

        <div
          v-show="filtersOpen"
          class="catalog-filters-dropdown"
          role="dialog"
          aria-label="Поиск и фильтры каталога"
          @click.stop
          @pointerdown.stop
        >
          <div>
            <label for="catalog-search-query" class="text-sm font-semibold text-neutral-600">
              Поиск по названию
            </label>
            <IconInput
              id="catalog-search-query"
              v-model="query"
              surface="muted"
              :icon="Search"
              placeholder="Портрет, свадьба, фотограф…"
              container-class="catalog-filter-field mt-2"
              icon-class="!min-w-4 !h-4"
              class="!text-[16px] !font-normal leading-none"
            />
          </div>

          <div class="mt-3">
            <label for="catalog-city-filter" class="text-sm font-semibold text-neutral-600">
              Город
            </label>
            <Select
              v-model="activeCity"
              v-model:open="citySelectOpen"
            >
              <SelectTrigger
                id="catalog-city-filter"
                variant="muted"
                class="mt-2"
                @pointerdown.stop
                @click.stop
              >
                <SelectValue placeholder="Все города" />
              </SelectTrigger>
              <SelectContent
                :portal="false"
                position="popper"
                side="bottom"
                align="start"
                :side-offset="4"
                class="catalog-filter-select-content"
              >
                <SelectItem
                  v-for="city in availableCities"
                  :key="city"
                  :value="city"
                >
                  {{ city }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        class="rounded-full border px-4 py-2 text-sm transition"
        :class="activeCategory === category ? 'genre-btn-active' : 'genre-btn-inactive'"
        @click="selectCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <div
      v-if="catalogLoading"
      class="mt-16 flex min-h-[280px] items-center justify-center"
      role="status"
      aria-label="Загрузка каталога"
    >
      <Loader2
        class="h-14 w-14 animate-spin text-brand-mint"
        :stroke-width="1.75"
      />
    </div>

    <template v-else>
      <div class="mt-10 grid grid-cols-1 gap-4">
        <PortfolioCard
          v-for="work in displayedWorks"
          :key="work.id"
          :work="work"
          :is-liked="resolveCardLikeState(work).likedByMe"
          :likes-count="resolveCardLikeState(work).likesCount"
          :like-loading="likingWorkId === work.id"
          @toggle-like="toggleLike"
        />
      </div>

      <div
        v-if="hasMore"
        ref="loadMoreSentinel"
        class="mt-8 flex justify-center py-2"
        aria-hidden="true"
      >
        <span class="text-sm text-neutral-400">Загрузка…</span>
      </div>

      <div v-if="filteredWorks.length === 0" class="mt-16 text-center">
        <p class="text-lg font-bold">Ничего не найдено</p>
        <p class="mt-2 text-sm text-neutral-500">
          Попробуйте другую категорию, город или запрос
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "../../assets/globals.css";

.genre-btn-active {
  @apply border-brand-mint bg-brand-mint/15 text-brand-text font-medium;
}

.genre-btn-inactive {
  @apply border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300;
}

.catalog-filters {
  @apply relative shrink-0 self-start md:self-auto;
}

.catalog-filters-trigger {
  @apply flex h-[42px] w-[42px] items-center justify-center rounded-[12px] border border-neutral-200 bg-white text-brand-text transition hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40;
}

.catalog-filters-trigger--open {
  @apply border-brand-mint bg-brand-mint/15 text-black font-medium hover:border-brand-mint/30 hover:bg-brand-mint/20;
}

.catalog-filters-dropdown {
  @apply absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(100vw-2rem,20rem)] overflow-visible rounded-xl border border-neutral-200/90 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.1)];
}

.catalog-filter-field {
  @apply !h-[42px] w-full !gap-2.5 !rounded-[12px] !px-3;
}

.catalog-filter-select-content {
  @apply z-[60] w-[var(--reka-select-trigger-width)] min-w-[var(--reka-select-trigger-width)] rounded-[12px] border border-neutral-200 bg-white shadow-lg;
}
</style>
