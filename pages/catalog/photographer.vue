<script setup lang="ts">
import { ArrowLeft, BadgeCheck, Bell, Images, Trash2 } from '@lucide/vue'
import { getApiErrorMessage } from '~/api/client'
import {
  fetchSubscribersCount,
  fetchSubscriptionStatus,
  subscribeToPhotographer,
  unsubscribeFromPhotographer,
} from '~/api/subscriptions'
import { fetchPublicUser } from '~/api/users'
import {
  fetchPublicWorks,
  likeWork,
  resolveWorkImage,
  resolveWorkImages,
  unlikeWork,
} from '~/api/works'
import PortfolioCard from '~/components/Cards/PortfolioCard.vue'
import type { PortfolioCardWork } from '~/components/Cards/PortfolioCard.vue'
import emailIcon from '~/assets/icons/email.svg'
import tgIcon from '~/assets/icons/tg.svg'
import vkIcon from '~/assets/icons/vk.svg'
import {
  DEFAULT_AVATAR,
  DEFAULT_PROFILE_BANNER_CLASS,
  resolveProfileBanner,
  resolveUserAvatar,
} from '~/composables/useUser'

const { $toast } = useNuxtApp()

const route = useRoute()
const { user, isLoggedIn, cabinetPath, accessToken } = useUser()
const { openAddWorkModal, createdWork, clearCreatedWork } = useAddWorkModal()

const photographerId = computed(() => {
  const raw = route.query.id
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : ''
})

function resolvePhotographerId() {
  if (photographerId.value) {
    return photographerId.value
  }

  if (import.meta.server) {
    return useRequestURL().searchParams.get('id') ?? ''
  }

  return ''
}

const isOwnProfile = computed(
  () =>
    isLoggedIn.value
    && photographerId.value !== ''
    && user.value?.id === photographerId.value,
)

type ProfileCardWork = PortfolioCardWork & {
  likesCount: number
  likedByMe: boolean
  source: 'api'
}

const likeOverrides = ref<
  Record<string, { likesCount: number; likedByMe: boolean }>
>({})

const { data: publicProfile } = await useAsyncData(
  () => `photographer-public:${resolvePhotographerId()}`,
  async () => {
    const id = resolvePhotographerId()
    if (!id) return null
    const { user: publicUser } = await fetchPublicUser(id)
    return publicUser
  },
  { watch: [photographerId] },
)

const {
  data: profileWorks,
  refresh: refreshProfileWorks,
  status: profileWorksStatus,
} = await useAsyncData(
  () => `photographer-works:${resolvePhotographerId()}:${accessToken.value ?? ''}`,
  async () => {
    const id = resolvePhotographerId()
    if (!id) return [] as ProfileCardWork[]

    const { works } = await fetchPublicWorks(id, accessToken.value)

    return works.map<ProfileCardWork>((work) => ({
      id: work.id,
      title: work.title,
      image: resolveWorkImage(work.image),
      images: resolveWorkImages(work),
      category: work.category,
      year: work.year,
      photographer: publicProfile.value?.name || 'Фотограф',
      likesCount: work.likesCount,
      likedByMe: work.likedByMe,
      source: 'api',
    }))
  },
  { watch: [photographerId, accessToken], server: false },
)

const profileWorksLoading = computed(
  () => profileWorksStatus.value === 'pending' || profileWorksStatus.value === 'idle',
)

watch(
  profileWorks,
  (list) => {
    if (!list) return

    const next: Record<string, { likesCount: number; likedByMe: boolean }> = {}
    for (const work of list) {
      next[work.id] = {
        likesCount: work.likesCount,
        likedByMe: work.likedByMe,
      }
    }
    likeOverrides.value = next
  },
  { immediate: true },
)

const likingWorkId = ref<string | null>(null)
const isSubscribed = ref(false)
const subscriptionLoading = ref(false)
const subscribersCount = ref(0)

async function loadSubscribersCount() {
  if (!photographerId.value) {
    subscribersCount.value = 0
    return
  }

  try {
    const response = await fetchSubscribersCount(photographerId.value)
    subscribersCount.value = response.subscribersCount
  } catch {
    subscribersCount.value = 0
  }
}

async function loadSubscriptionStatus() {
  if (!photographerId.value || isOwnProfile.value) {
    isSubscribed.value = false
    return
  }

  const token = accessToken.value
  if (!token) {
    isSubscribed.value = false
    return
  }

  try {
    const response = await fetchSubscriptionStatus(photographerId.value, token)
    isSubscribed.value = response.subscribed
  } catch {
    isSubscribed.value = false
  }
}

async function toggleSubscription() {
  if (isOwnProfile.value || subscriptionLoading.value || !photographerId.value) return

  const token = accessToken.value
  if (!token) {
    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  subscriptionLoading.value = true

  try {
    if (isSubscribed.value) {
      await unsubscribeFromPhotographer(photographerId.value, token)
      isSubscribed.value = false
      subscribersCount.value = Math.max(0, subscribersCount.value - 1)
    } else {
      await subscribeToPhotographer(photographerId.value, token)
      isSubscribed.value = true
      subscribersCount.value += 1
    }
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось изменить подписку — попробуйте позже')
  } finally {
    subscriptionLoading.value = false
  }
}

watch([photographerId, accessToken, isOwnProfile], loadSubscriptionStatus, { immediate: true })
watch(photographerId, loadSubscribersCount, { immediate: true })

function resolveCardLikeState(work: ProfileCardWork) {
  const override = likeOverrides.value[work.id]
  if (override) {
    return override
  }

  return {
    likesCount: work.likesCount,
    likedByMe: work.likedByMe,
  }
}

async function toggleLike(workId: string, event: Event) {
  event.preventDefault()
  event.stopPropagation()

  const work = portfolioCards.value.find((item) => item.id === workId)
  if (!work || likingWorkId.value) return

  const current = resolveCardLikeState(work)

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

const profileName = computed(
  () => publicProfile.value?.name || 'Фотограф',
)

const profileCity = computed(() => publicProfile.value?.city?.trim() || '')

useHead({
  title: computed(() =>
    profileName.value === 'Фотограф' ? 'Профиль фотографа' : profileName.value,
  ),
})

const profileAvatar = computed(
  () => resolveUserAvatar(publicProfile.value?.avatar) || DEFAULT_AVATAR,
)

const profileBannerUrl = computed(() =>
  resolveProfileBanner(publicProfile.value?.profileBanner),
)

const works = computed(() => profileWorks.value ?? [])
const worksCount = computed(() => works.value.length)

const portfolioCards = computed(() => works.value)

function onWorkCreated() {
  refreshProfileWorks()
}

watch(createdWork, (work) => {
  if (!work) return
  onWorkCreated()
  clearCreatedWork()
})

const vkUrl = computed(() => publicProfile.value?.vkUrl?.trim() || '')
const telegramUrl = computed(() => publicProfile.value?.telegramUrl?.trim() || '')
const contactEmail = computed(() => publicProfile.value?.contactEmail?.trim() || '')

const subscribeButtonClass = computed(() => {
  if (isOwnProfile.value) {
    return 'btn-main-primary'
  }

  if (isSubscribed.value) {
    return 'rounded-full border border-neutral-200 bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-800'
  }

  return 'rounded-full bg-black text-white transition hover:bg-neutral-200 hover:text-black'
})
</script>

<template>
  <div class="page-shell flex flex-col gap-0">
    <NuxtLink
      :to="isOwnProfile ? cabinetPath : '/catalog'"
      class="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-brand-mint"
    >
      <ArrowLeft class="h-4 w-4" />
      {{ isOwnProfile ? 'Назад в кабинет' : 'Назад в каталог' }}
    </NuxtLink>
    <article class="profile-header mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
      <div class="profile-header-banner h-40 overflow-hidden md:h-44">
        <img
          v-if="profileBannerUrl"
          :src="profileBannerUrl"
          alt=""
          class="h-full w-full object-cover"
        >
        <div
          v-else
          class="h-full w-full"
          :class="DEFAULT_PROFILE_BANNER_CLASS"
        />
      </div>

      <div class="profile-header-body px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <img
              :src="profileAvatar"
              :alt="profileName"
              class="profile-header-avatar shrink-0 self-start rounded-full border-4 border-white object-cover shadow-lg"
            >

            <div class="profile-header-info min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <h1 class="truncate text-2xl font-black leading-none tracking-tight text-brand-text sm:text-[1.65rem]">
                  {{ profileName }}
                </h1>
                <BadgeCheck class="h-5 w-5 shrink-0 text-brand-mint-dark" />
              </div>

              <p class="text-sm text-neutral-500">
                {{ subscribersCount.toLocaleString('ru-RU') }} подписчиков ·
                {{ profileWorksLoading ? '…' : worksCount }} работ
                <template v-if="profileCity"> · г. {{ profileCity }}</template>
              </p>

              <div class="flex flex-wrap items-center gap-3 pt-1">
                <a
                  :href="vkUrl || undefined"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="transition-opacity hover:opacity-80"
                  :class="!vkUrl && 'pointer-events-none opacity-35'"
                  :aria-disabled="!vkUrl"
                  :tabindex="vkUrl ? 0 : -1"
                  @click="!vkUrl && $event.preventDefault()"
                >
                  <img
                    :src="vkIcon"
                    alt="VK"
                    class="h-7 w-7"
                  >
                </a>

                <a
                  :href="telegramUrl || undefined"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="transition-opacity hover:opacity-80"
                  :class="!telegramUrl && 'pointer-events-none opacity-35'"
                  :aria-disabled="!telegramUrl"
                  :tabindex="telegramUrl ? 0 : -1"
                  @click="!telegramUrl && $event.preventDefault()"
                >
                  <img
                    :src="tgIcon"
                    alt="Telegram"
                    class="h-7 w-7"
                  >
                </a>

                <a
                  :href="contactEmail ? `mailto:${contactEmail}` : undefined"
                  class="transition-opacity hover:opacity-80"
                  :class="!contactEmail && 'pointer-events-none opacity-35'"
                  :aria-disabled="!contactEmail"
                  :tabindex="contactEmail ? 0 : -1"
                  @click="!contactEmail && $event.preventDefault()"
                >
                  <img
                    :src="emailIcon"
                    alt="Email"
                    class="h-7 w-7"
                  >
                </a>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex w-full shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold sm:w-auto sm:self-center disabled:opacity-60"
            :class="subscribeButtonClass"
            :disabled="isOwnProfile || subscriptionLoading"
            @click="toggleSubscription"
          >
            <Bell
              v-if="!isOwnProfile && !isSubscribed && !subscriptionLoading"
              class="h-4 w-4 shrink-0"
              :stroke-width="2"
            />
            <Trash2
              v-else-if="!isOwnProfile && isSubscribed && !subscriptionLoading"
              class="h-4 w-4 shrink-0"
              :stroke-width="2"
            />
            {{
              isOwnProfile
                ? 'Это ваш профиль'
                : subscriptionLoading
                  ? '…'
                  : isSubscribed
                    ? 'Отписаться'
                    : 'Подписаться'
            }}
          </button>
        </div>
      </div>
    </article>

    <section class="mt-6 w-full">
      <button
        v-if="worksCount === 0 && isOwnProfile"
        type="button"
        class="flex w-full flex-col items-center justify-center rounded-3xl border border-black/10 bg-white px-6 py-16 text-center transition hover:border-black/20 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40"
        @click="openAddWorkModal"
      >
        <Images class="h-20 w-20 text-neutral-300" :stroke-width="1.25" />
        <p class="mt-5 text-base font-semibold text-neutral-700">
          Добавьте первую работу
        </p>
      </button>

      <div
        v-else-if="profileWorksLoading"
        class="flex w-full flex-col items-center justify-center rounded-3xl border border-black/10 bg-white px-6 py-16 text-center"
      >
        <Images class="h-20 w-20 animate-pulse text-neutral-300" :stroke-width="1.25" />
        <p class="mt-5 text-base font-semibold text-neutral-700">
          Загрузка работ…
        </p>
      </div>

      <div
        v-else-if="worksCount === 0"
        class="flex w-full flex-col items-center justify-center rounded-3xl border border-black/10 bg-white px-6 py-16 text-center"
      >
        <Images class="h-20 w-20 text-neutral-300" :stroke-width="1.25" />
        <p class="mt-5 text-base font-semibold text-neutral-700">
          Пока нет работ в портфолио
        </p>
      </div>

      <div v-else class="mt-2 grid w-full grid-cols-1 gap-4">
        <PortfolioCard
          v-for="card in portfolioCards"
          :key="card.id"
          :work="card"
          :is-liked="resolveCardLikeState(card).likedByMe"
          :likes-count="resolveCardLikeState(card).likesCount"
          :like-loading="likingWorkId === card.id"
          @toggle-like="toggleLike"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-header-avatar {
  width: 120px;
  height: 120px;
  margin-top: -60px;
}

.profile-header-info {
  padding-top: 0rem;
}

@media (min-width: 640px) {
  .profile-header-info {
    padding-top: 1.25rem;
  }
  .profile-header-avatar {
    width: 140px;
    height: 140px;
    margin-top: -70px;
  }
}
</style>
