<script setup lang="ts">
import { Check, Eye, ImagePlus, Images, Trash2, Upload } from '@lucide/vue'
import type { ContactKind } from '~/api/users'
import {
  removeProfileBanner,
  updateUserContact,
  uploadProfileBanner,
} from '~/api/users'
import { getApiErrorMessage } from '~/api/client'
import type { Work } from '~/api/works'
import { deleteWork as deleteWorkApi, fetchMyWorks, resolveWorkImage } from '~/api/works'
import { fetchMatchingOrders } from '~/api/orders'
import type { PhotographerOrder } from '~/api/orders'
import CabinetPortfolioCard from '~/components/Cards/CabinetPortfolioCard.vue'
import PhotographerOrderCard from '~/components/Cards/PhotographerOrderCard.vue'
import CustomInput from '~/components/Inputs/CustomInput.vue'
import EditWorkModal from '~/components/Modals/EditWorkModal.vue'
import DeleteWorkConfirmModal from '~/components/Modals/DeleteWorkConfirmModal.vue'
import {
  DEFAULT_PROFILE_BANNER_CLASS,
  resolveProfileBanner,
} from '~/composables/useUser'
import emailIcon from '~/assets/icons/email.svg'
import tgIcon from '~/assets/icons/tg.svg'
import vkIcon from '~/assets/icons/vk.svg'

definePageMeta({
  middleware: 'auth-client',
})

useHead({ title: 'Кабинет фотографа' })

const { $toast } = useNuxtApp()

const route = useRoute()
const { user, accessToken } = useUser()
const { openAddWorkModal, createdWork, clearCreatedWork } = useAddWorkModal()
const {
  isOpen: editWorkModalOpen,
  editingWork,
  openEditWorkModal,
  notifyWorkUpdated,
  updatedWork,
  clearUpdatedWork,
} = useEditWorkModal()

function openProfilePreview() {
  if (!user.value) return
  navigateTo({
    path: '/catalog/photographer',
    query: { id: user.value.id },
  })
}

const tabKeys = ['portfolio', 'announcements', 'contacts', 'settings'] as const
type TabKey = (typeof tabKeys)[number]

const tab = ref<TabKey>('portfolio')

const tabItems = [
  { name: 'Портфолио', icon: null },
  { name: 'Объявления', icon: null },
  { name: 'Контакты', icon: null },
  { name: 'Кастомизация', icon: null },
]

const tabIndex = computed({
  get: () => tabKeys.indexOf(tab.value),
  set: (index: number) => {
    const key = tabKeys[index]
    if (key) {
      tab.value = key
    }
  },
})

function applyTabFromQuery() {
  const queryTab = route.query.tab
  const normalizedTab = queryTab === 'categories' ? 'contacts' : queryTab

  if (typeof normalizedTab === 'string' && tabKeys.includes(normalizedTab as TabKey)) {
    tab.value = normalizedTab as TabKey
  }
}

watch(() => route.query.tab, applyTabFromQuery)

onMounted(applyTabFromQuery)

type PortfolioItem = {
  id: string
  title: string
  category: string
  year: number
  image: string
}

function toPortfolioCard(work: Work): PortfolioItem {
  return {
    id: work.id,
    title: work.title,
    category: work.category,
    year: work.year,
    image: resolveWorkImage(work.image),
  }
}

const portfolio = ref<Work[]>([])
const portfolioLoading = ref(false)
const deletingWorkId = ref<string | null>(null)
const deleteConfirmOpen = ref(false)
const pendingDeleteWorkId = ref<string | null>(null)

const pendingDeleteWorkTitle = computed(() => {
  const workId = pendingDeleteWorkId.value
  if (!workId) return ''
  return portfolio.value.find((item) => item.id === workId)?.title ?? ''
})

watch(deleteConfirmOpen, (isOpen) => {
  if (!isOpen && !deletingWorkId.value) {
    pendingDeleteWorkId.value = null
  }
})

async function loadPortfolio() {
  const token = accessToken.value
  if (!token) return

  portfolioLoading.value = true

  try {
    const { works } = await fetchMyWorks(token)
    portfolio.value = works
  } catch {
    portfolio.value = []
  } finally {
    portfolioLoading.value = false
  }
}

function onWorkCreated(work: Work) {
  portfolio.value = [work, ...portfolio.value]
}

watch(createdWork, (work) => {
  if (!work) return
  onWorkCreated(work)
  clearCreatedWork()
})

function onWorkUpdated(work: Work) {
  portfolio.value = portfolio.value.map((item) =>
    item.id === work.id ? work : item,
  )
}

watch(updatedWork, (work) => {
  if (!work) return
  onWorkUpdated(work)
  clearUpdatedWork()
})

function openWork(workId: string) {
  navigateTo(`/catalog/${workId}`)
}

function editWork(workId: string) {
  void openEditWork(workId)
}

async function openEditWork(workId: string) {
  const token = accessToken.value

  if (token) {
    try {
      const { works } = await fetchMyWorks(token)
      portfolio.value = works
      const work = works.find((item) => item.id === workId)
      if (work) {
        openEditWorkModal(work)
        return
      }
    } catch {
      // fallback to cached portfolio entry
    }
  }

  const work = portfolio.value.find((item) => item.id === workId)
  if (work) {
    openEditWorkModal(work)
  }
}

function deleteWork(workId: string) {
  pendingDeleteWorkId.value = workId
  deleteConfirmOpen.value = true
}

async function confirmDeleteWork() {
  const workId = pendingDeleteWorkId.value
  if (!workId || !import.meta.client) return

  const token = accessToken.value
  if (!token) {
    $toast.error('Необходимо войти в аккаунт', 'Войдите снова и повторите попытку')
    deleteConfirmOpen.value = false
    return
  }

  deletingWorkId.value = workId

  try {
    await deleteWorkApi(workId, token)
    portfolio.value = portfolio.value.filter((item) => item.id !== workId)
    deleteConfirmOpen.value = false
    pendingDeleteWorkId.value = null
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Работа не удалена из портфолио')
  } finally {
    deletingWorkId.value = null
  }
}

onMounted(loadPortfolio)

const matchingOrders = ref<PhotographerOrder[]>([])
const matchingOrdersLoading = ref(false)

const hasProfileCity = computed(() => Boolean(user.value?.city?.trim()))
const hasPortfolioWorks = computed(() => portfolio.value.length > 0)

async function loadMatchingOrders() {
  const token = accessToken.value
  if (!token) return

  matchingOrdersLoading.value = true

  try {
    const response = await fetchMatchingOrders(token)
    matchingOrders.value = response.orders
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось загрузить объявления клиентов')
  } finally {
    matchingOrdersLoading.value = false
  }
}

watch(tab, (value) => {
  if (value === 'announcements' && !matchingOrdersLoading.value) {
    loadMatchingOrders()
  }
}, { immediate: true })

watch(
  () => user.value?.city,
  () => {
    if (tab.value === 'announcements') {
      loadMatchingOrders()
    }
  },
)

type ContactItem = {
  key: ContactKind
  label: string
  icon: string
  placeholder: string
  inputType: 'url' | 'email'
}

const contactItems: ContactItem[] = [
  {
    key: 'vk',
    label: 'ВКонтакте',
    icon: vkIcon,
    placeholder: 'https://vk.com/username',
    inputType: 'url',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: tgIcon,
    placeholder: 'https://t.me/username',
    inputType: 'url',
  },
  {
    key: 'email',
    label: 'Email',
    icon: emailIcon,
    placeholder: 'photo@example.com',
    inputType: 'email',
  },
]

const contactValues = ref<Record<ContactKind, string>>({
  vk: '',
  telegram: '',
  email: '',
})

const savingContact = ref<ContactKind | null>(null)
const contactSaved = ref<Record<ContactKind, boolean>>({
  vk: false,
  telegram: false,
  email: false,
})

function syncContactsFromUser() {
  contactValues.value = {
    vk: user.value?.vkUrl?.trim() ?? '',
    telegram: user.value?.telegramUrl?.trim() ?? '',
    email: user.value?.contactEmail?.trim() ?? '',
  }
}

watch(user, syncContactsFromUser, { immediate: true })

async function saveContact(kind: ContactKind) {
  const token = accessToken.value
  if (!token) {
    $toast.error('Необходимо войти в аккаунт', 'Войдите снова и повторите попытку')
    return
  }

  savingContact.value = kind
  contactSaved.value[kind] = false

  try {
    const { user: updated } = await updateUserContact(
      kind,
      contactValues.value[kind],
      token,
    )
    user.value = updated
    syncContactsFromUser()
    contactSaved.value[kind] = true
    $toast.success('Контакт сохранён', 'Ссылка отображается в вашем публичном профиле')
    window.setTimeout(() => {
      contactSaved.value[kind] = false
    }, 2000)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось сохранить контакт — проверьте формат')
  } finally {
    savingContact.value = null
  }
}

const bannerInputRef = ref<HTMLInputElement | null>(null)
const bannerLoading = ref(false)
const bannerSuccess = ref(false)

const profileBannerPreview = computed(() => resolveProfileBanner(user.value?.profileBanner))
const hasCustomBanner = computed(() => Boolean(profileBannerPreview.value))

function openBannerPicker() {
  bannerInputRef.value?.click()
}

async function onBannerSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  const token = accessToken.value
  if (!token) {
    $toast.error('Необходимо войти в аккаунт', 'Войдите снова и повторите попытку')
    return
  }

  bannerLoading.value = true
  bannerSuccess.value = false

  try {
    const { user: updated } = await uploadProfileBanner(file, token)
    user.value = updated
    bannerSuccess.value = true
    $toast.success('Фон профиля обновлён', 'Изменения видны на публичной странице')
    window.setTimeout(() => {
      bannerSuccess.value = false
    }, 2000)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось загрузить баннер — проверьте формат и размер')
  } finally {
    bannerLoading.value = false
  }
}

async function resetProfileBanner() {
  if (!hasCustomBanner.value) return
  if (!import.meta.client) return
  if (!window.confirm('Вернуть стандартный фон профиля?')) return

  const token = accessToken.value
  if (!token) {
    $toast.error('Необходимо войти в аккаунт', 'Войдите снова и повторите попытку')
    return
  }

  bannerLoading.value = true
  bannerSuccess.value = false

  try {
    const { user: updated } = await removeProfileBanner(token)
    user.value = updated
    bannerSuccess.value = true
    $toast.success('Стандартный фон восстановлен', 'На странице профиля снова базовый фон')
    window.setTimeout(() => {
      bannerSuccess.value = false
    }, 2000)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось сбросить фон — попробуйте позже')
  } finally {
    bannerLoading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">Кабинет фотографа</h1>
        <p class="page-subtitle">Портфолио, объявления клиентов, контакты и кастомизация</p>
      </div>

      <SectionSwitcher
        v-model:active-item="tabIndex"
        :items="tabItems"
        main-class="w-fit !max-w-[370px]"
      />
    </div>

    <section v-if="tab === 'portfolio'" class="mt-10">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 class="text-xl font-bold">Примеры работ</h2>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="btn-main-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs"
            @click="openProfilePreview"
          >
            <Eye class="h-4 w-4" />
            Превью
          </button>
          <button
            type="button"
            class="btn-main-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs"
            @click="openAddWorkModal"
          >
            <Upload class="h-4 w-4" />
            Добавить работу
          </button>
        </div>
      </div>

      <p v-if="portfolioLoading" class="mt-5 text-sm text-neutral-500">
        Загрузка работ…
      </p>

      <button
        v-else-if="portfolio.length === 0"
        type="button"
        class="mt-5 flex w-full flex-col items-center justify-center rounded-3xl border border-black/10 bg-white px-6 py-16 text-center transition hover:border-black/20 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40"
        @click="openAddWorkModal"
      >
        <Images class="h-20 w-20 text-neutral-300" :stroke-width="1.25" />
        <p class="mt-5 text-base font-semibold text-neutral-700">
          Добавьте первую работу
        </p>
      </button>

      <div v-else class="mt-5 grid w-full grid-cols-1 gap-4">
        <CabinetPortfolioCard
          v-for="w in portfolio"
          :key="w.id"
          class="w-full"
          :work="toPortfolioCard(w)"
          :deleting="deletingWorkId === w.id"
          @edit="editWork(w.id)"
          @open="openWork(w.id)"
          @delete="deleteWork(w.id)"
        />
      </div>
    </section>

    <section v-else-if="tab === 'announcements'" class="mt-10">
      <h2 class="text-xl font-bold">Объявления</h2>
      <p class="mt-2 text-sm text-neutral-500">
        Запросы на быстрый поиск — показываем, если город в заявке совпадает с вашим и в портфолио есть работа в нужном жанре
      </p>

      <div
        v-if="matchingOrdersLoading"
        class="mt-5 rounded-3xl border border-neutral-200/80 bg-white px-5 py-10 text-center text-sm text-neutral-500"
      >
        Загрузка объявлений…
      </div>

      <div
        v-else-if="!hasProfileCity"
        class="mt-5 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-12 text-center"
      >
        <p class="text-sm font-medium text-neutral-600">Укажите город в настройках профиля</p>
        <p class="mt-2 text-sm text-neutral-500">
          Без города мы не сможем подобрать подходящие запросы клиентов
        </p>
      </div>

      <div
        v-else-if="!hasPortfolioWorks"
        class="mt-5 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-12 text-center"
      >
        <p class="text-sm font-medium text-neutral-600">Добавьте работы в портфолио</p>
        <p class="mt-2 text-sm text-neutral-500">
          Объявления приходят только по тем жанрам, в которых у вас уже есть примеры
        </p>
        <button
          type="button"
          class="btn-main-primary mt-5 inline-flex px-5 py-2.5 text-sm"
          @click="openAddWorkModal"
        >
          Добавить работу
        </button>
      </div>

      <div
        v-else-if="!matchingOrders.length"
        class="mt-5 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-12 text-center"
      >
        <p class="text-sm font-medium text-neutral-600">Пока нет подходящих объявлений</p>
        <p class="mt-2 text-sm text-neutral-500">
          Когда клиент оставит заявку с вашим городом съёмки и нужным жанром — она появится здесь
        </p>
      </div>

      <div v-else class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PhotographerOrderCard
          v-for="order in matchingOrders"
          :key="order.id"
          :order="order"
        />
      </div>
    </section>

    <section v-else-if="tab === 'contacts'" class="mt-10">
      <h2 class="text-xl font-bold">Контакты</h2>
      <p class="mt-2 text-sm text-neutral-500">
        Ссылки отображаются в публичном профиле. Можно оставить поле пустым.
      </p>

      <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="contact in contactItems"
          :key="contact.key"
          class="soft-card flex flex-col p-6"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <img
                :src="contact.icon"
                :alt="contact.label"
                class="h-7 w-7 shrink-0"
              >
              <p class="text-lg font-bold text-brand-text">
                {{ contact.label }}
              </p>
            </div>

            <span
              v-if="contactSaved[contact.key]"
              class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-mint-dark"
            >
              <Check class="h-4 w-4" stroke-width="2.5" />
              Сохранено
            </span>
          </div>

          <CustomInput
            v-model="contactValues[contact.key]"
            :type="contact.inputType"
            :placeholder="contact.placeholder"
            container-class="mt-4"
            :disabled="savingContact === contact.key"
          />

          <button
            type="button"
            class="btn-main-primary mt-4 w-full px-4 py-2.5 text-xs"
            :disabled="savingContact === contact.key"
            @click="saveContact(contact.key)"
          >
            {{ savingContact === contact.key ? 'Сохранение…' : 'Сохранить' }}
          </button>
        </article>
      </div>
    </section>

    <section v-else class="mt-10">
      <h2 class="text-xl font-bold">Кастомизация</h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-500">
        Фон шапки на публичной странице профиля. <br> Лучше всего подойдёт изображение
        <span class="font-medium text-brand-text">1600×400 px</span>
        (соотношение 4:1) <br> JPG, PNG или WebP, до 5 МБ.
      </p>

      <article class="soft-card mt-5 overflow-hidden p-0">
        <div
          class="group relative h-40 overflow-hidden border-b border-neutral-200/80 sm:h-44"
        >
          <img
            v-if="profileBannerPreview"
            :src="profileBannerPreview"
            alt="Фон профиля"
            class="h-full w-full object-cover"
          >
          <div
            v-else
            class="h-full w-full"
            :class="DEFAULT_PROFILE_BANNER_CLASS"
          />

          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
          />

          <span
            v-if="bannerSuccess"
            class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-mint-dark shadow-sm"
          >
            <Check class="h-3.5 w-3.5" stroke-width="2.5" />
            Сохранено
          </span>
        </div>

        <div class="p-5 sm:p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-base font-bold text-brand-text">Фон профиля</p>
              <p class="mt-1 text-sm text-neutral-500">
                {{ hasCustomBanner ? 'Своё изображение' : 'Стандартный градиент' }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <input
                ref="bannerInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="sr-only"
                :disabled="bannerLoading"
                @change="onBannerSelected"
              >

              <button
                type="button"
                class="btn-main-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
                :disabled="bannerLoading"
                @click="openBannerPicker"
              >
                <ImagePlus class="h-4 w-4" />
                {{ bannerLoading ? 'Загрузка…' : hasCustomBanner ? 'Заменить фон' : 'Загрузить фон' }}
              </button>

              <button
                v-if="hasCustomBanner"
                type="button"
                class="btn-main-outline inline-flex items-center gap-2 px-4 py-2.5 text-xs"
                :disabled="bannerLoading"
                @click="resetProfileBanner"
              >
                <Trash2 class="h-4 w-4" />
                Сбросить
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <EditWorkModal
      v-model:open="editWorkModalOpen"
      :work="editingWork"
      @updated="notifyWorkUpdated"
    />

    <DeleteWorkConfirmModal
      v-model:open="deleteConfirmOpen"
      :work-title="pendingDeleteWorkTitle"
      :loading="Boolean(deletingWorkId)"
      @confirm="confirmDeleteWork"
    />
  </div>
</template>
