<script setup lang="ts">
import { getApiErrorMessage } from '~/api/client'
import { createOrder } from '~/api/orders'
import CityAutocompleteInput from '~/components/Inputs/CityAutocompleteInput.vue'
import CustomInput from '~/components/Inputs/CustomInput.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { WORK_CATEGORIES } from '~/data/work-categories'
import { isRussianCity } from '~/data/russian-cities'

const emit = defineEmits<{
  created: []
}>()

const { $toast } = useNuxtApp()
const route = useRoute()
const { isLoggedIn, accessToken } = useUser()

const category = ref<string | undefined>()
const city = ref('')
const phone = ref('')
const loading = ref(false)

function resetForm() {
  category.value = undefined
  city.value = ''
  phone.value = ''
}

async function onSubmit() {
  if (!isLoggedIn.value) {
    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  const trimmedCategory = category.value?.trim()
  const trimmedCity = city.value.trim()
  const trimmedPhone = phone.value.trim()

  if (!trimmedCategory || !trimmedCity || !trimmedPhone) {
    $toast.error('Заполните все поля формы', 'Укажите жанр, город и телефон')
    return
  }

  if (!isRussianCity(trimmedCity)) {
    $toast.error('Выберите город из списка подсказок', 'Начните вводить и выберите город из списка')
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

  loading.value = true

  try {
    await createOrder(
      {
        category: trimmedCategory,
        city: trimmedCity,
        phone: trimmedPhone,
      },
      token,
    )

    $toast.success(
      'Заявка отправлена',
      'Фотографы из вашего города скоро предложат портфолио',
    )
    resetForm()
    emit('created')
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось создать заявку — попробуйте позже')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    class="relative overflow-visible rounded-[2rem] max-md:rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] md:p-6"
  >
    <span
      class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-mint-dark to-brand-mint-dark via-brand-mint px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#e8faf3]"
    >
      Быстрый поиск
    </span>

    <h4 class="mt-3 text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
      Подбор автора
    </h4>
    <p class="mt-1 text-sm text-neutral-500">
      Нет времени листать каталог? Оставьте задачу — свободные авторы сами предложат портфолио.
    </p>

    <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="text-sm font-semibold text-neutral-600">Жанр съёмки</label>
        <Select v-model="category" :disabled="loading">
          <SelectTrigger
            class="mt-2 !h-[46px] !w-full rounded-[14px] border border-[#d9dfdc] bg-[#f6f7f6] px-4 text-[16px] font-medium text-[var(--base-color)] shadow-none focus-visible:border-[#20d489] focus-visible:ring-0 data-[size=default]:!h-[46px]"
          >
            <SelectValue placeholder="Выберите жанр съёмки" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            :side-offset="4"
            class="z-[250] w-[var(--reka-select-trigger-width)] min-w-[var(--reka-select-trigger-width)] rounded-[14px] border border-[#d9dfdc] bg-white shadow-lg"
          >
            <SelectItem
              v-for="item in WORK_CATEGORIES"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label class="text-sm font-semibold text-neutral-600">Город</label>
        <CityAutocompleteInput
          v-model="city"
          placeholder="Начните вводить город"
          container-class="mt-2"
          :disabled="loading"
        />
      </div>

      <div>
        <label class="text-sm font-semibold text-neutral-600">Телефон</label>
        <CustomInput
          v-model="phone"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          container-class="mt-2"
          :disabled="loading"
        />
      </div>

      <button
        type="submit"
        class="mt-2 w-full rounded-lg bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e8faf3] transition hover:bg-brand-mint hover:text-[#1a1a1a] disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Отправка…' : 'Запустить умный поиск' }}
      </button>
    </form>

    <p class="mt-5 text-center text-xs text-[#1a1a1a]/45">
      Нажимая кнопку, вы соглашаетесь с правилами платформы Photo Shoot
    </p>
  </section>
</template>
