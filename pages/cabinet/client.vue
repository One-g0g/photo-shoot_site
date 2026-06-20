<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { getApiErrorMessage } from '~/api/client'
import type { Order } from '~/api/orders'
import { fetchMyOrders, deleteOrder } from '~/api/orders'
import type { Subscription } from '~/api/subscriptions'
import {
  fetchMySubscriptions,
  unsubscribeFromPhotographer,
} from '~/api/subscriptions'
import ClientOrderStrip from '~/components/Cards/ClientOrderStrip.vue'
import ClientSubscriptionStrip from '~/components/Cards/ClientSubscriptionStrip.vue'
import QuickSearchOrderModal from '~/components/Modals/QuickSearchOrderModal.vue'

definePageMeta({
  middleware: 'auth-client',
})

useHead({ title: 'Кабинет клиента' })

const { $toast } = useNuxtApp()

const route = useRoute()
const { accessToken } = useUser()

const tabKeys = ['subscriptions', 'quick-search'] as const
type TabKey = (typeof tabKeys)[number]

const tab = ref<TabKey>('subscriptions')

const tabItems = [
  { name: 'Подписки', icon: null },
  { name: 'Быстрый поиск', icon: null },
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
  const normalizedTab = queryTab === 'favorites' ? 'subscriptions' : queryTab

  if (typeof normalizedTab === 'string' && tabKeys.includes(normalizedTab as TabKey)) {
    tab.value = normalizedTab as TabKey
  }
}

watch(() => route.query.tab, applyTabFromQuery)

onMounted(() => {
  applyTabFromQuery()
  loadSubscriptions()
  loadOrders()
})

const subscriptions = ref<Subscription[]>([])
const subscriptionsLoading = ref(false)
const unsubscribingId = ref<string | null>(null)

async function loadSubscriptions() {
  const token = accessToken.value
  if (!token) return

  subscriptionsLoading.value = true

  try {
    const response = await fetchMySubscriptions(token)
    subscriptions.value = response.subscriptions
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось загрузить список подписок')
  } finally {
    subscriptionsLoading.value = false
  }
}

async function handleUnsubscribe(subscription: Subscription) {
  const token = accessToken.value
  if (!token || unsubscribingId.value) return

  unsubscribingId.value = subscription.id

  try {
    await unsubscribeFromPhotographer(subscription.photographer.id, token)
    subscriptions.value = subscriptions.value.filter(
      (item) => item.id !== subscription.id,
    )
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Подписка не отменена — попробуйте позже')
  } finally {
    unsubscribingId.value = null
  }
}

const orders = ref<Order[]>([])
const ordersLoading = ref(false)
const deletingOrderId = ref<string | null>(null)
const quickSearchModalOpen = ref(false)

function onQuickSearchCreated() {
  loadOrders()
}

async function loadOrders() {
  const token = accessToken.value
  if (!token) return

  ordersLoading.value = true

  try {
    const response = await fetchMyOrders(token)
    orders.value = response.orders
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось загрузить ваши заявки')
  } finally {
    ordersLoading.value = false
  }
}

async function handleDeleteOrder(order: Order) {
  const token = accessToken.value
  if (!token || deletingOrderId.value) return

  deletingOrderId.value = order.id

  try {
    await deleteOrder(order.id, token)
    orders.value = orders.value.filter((item) => item.id !== order.id)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Заявка не удалена — попробуйте позже')
  } finally {
    deletingOrderId.value = null
  }
}

watch(tab, (value) => {
  if (value === 'subscriptions' && !subscriptionsLoading.value) {
    loadSubscriptions()
  }

  if (value === 'quick-search' && !ordersLoading.value) {
    loadOrders()
  }
})
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">Кабинет клиента</h1>
        <p class="page-subtitle">Подписки на фотографов и заявки на подбор</p>
      </div>

      <SectionSwitcher
        v-model:active-item="tabIndex"
        :items="tabItems"
        main-class="w-fit"
      />
    </div>

    <section v-if="tab === 'subscriptions'" class="mt-10">
      <h2 class="text-xl font-bold">Подписки</h2>
      <p class="mt-2 text-sm text-neutral-500">
        Фотографы, на которых вы подписаны — следите за новыми работами в их портфолио
      </p>

      <div
        v-if="subscriptionsLoading"
        class="mt-5 rounded-3xl border border-neutral-200/80 bg-white px-5 py-10 text-center text-sm text-neutral-500"
      >
        Загрузка подписок…
      </div>

      <div
        v-else-if="!subscriptions.length"
        class="mt-5 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-12 text-center"
      >
        <p class="text-sm font-medium text-neutral-600">Пока нет подписок</p>
        <p class="mt-2 text-sm text-neutral-500">
          Подпишитесь на фотографа в каталоге, чтобы не пропускать новые работы
        </p>
        <NuxtLink to="/catalog" class="btn-main-primary mt-5 inline-flex px-5 py-2.5 text-sm">
          В каталог
        </NuxtLink>
      </div>

      <div v-else class="mt-5 flex flex-col gap-3">
        <ClientSubscriptionStrip
          v-for="subscription in subscriptions"
          :key="subscription.id"
          :subscription="subscription"
          :loading="unsubscribingId === subscription.id"
          @unsubscribe="handleUnsubscribe(subscription)"
        />
      </div>
    </section>

    <section v-else-if="tab === 'quick-search'" class="mt-10">
      <h2 class="text-xl font-bold">Быстрый поиск</h2>
      <p class="mt-2 text-sm text-neutral-500">
        Ваши заявки на подбор фотографа — авторы увидят их и смогут предложить портфолио
      </p>

      <div
        v-if="ordersLoading"
        class="mt-5 rounded-3xl border border-neutral-200/80 bg-white px-5 py-10 text-center text-sm text-neutral-500"
      >
        Загрузка заявок…
      </div>

      <div
        v-else-if="!orders.length"
        class="mt-5 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-12 text-center"
      >
        <p class="text-sm font-medium text-neutral-600">Пока нет заявок</p>
        <p class="mt-2 text-sm text-neutral-500">
          Создайте заявку — подходящие фотографы увидят её в объявлениях
        </p>
        <button
          type="button"
          class="btn-main-primary mt-5 inline-flex px-5 py-2.5 text-sm"
          @click="quickSearchModalOpen = true"
        >
          Создать заявку
        </button>
      </div>

      <div v-else class="mt-5 flex flex-col gap-3">
        <ClientOrderStrip
          v-for="order in orders"
          :key="order.id"
          :order="order"
          :deleting="deletingOrderId === order.id"
          @delete="handleDeleteOrder(order)"
        />
        <button
          type="button"
          class="group mx-auto mt-3 flex flex-col items-center gap-2"
          aria-label="Создать заявку"
          @click="quickSearchModalOpen = true"
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-brand-mint bg-brand-mint-light text-brand-mint-dark shadow-[0_4px_16px_rgba(32,212,137,0.22)] transition hover:border-brand-mint hover:bg-brand-mint hover:text-[#1a1a1a] group-hover:scale-105"
          >
            <Plus :size="22" :stroke-width="2.5" />
          </span>
          <span class="text-xs font-semibold text-brand-mint-dark transition group-hover:text-brand-mint">
            Новая заявка
          </span>
        </button>
      </div>
    </section>

    <QuickSearchOrderModal
      v-model:open="quickSearchModalOpen"
      @created="onQuickSearchCreated"
    />
  </div>
</template>
