<script setup lang="ts">
import { X } from '@lucide/vue'
import { getApiErrorMessage } from '~/api/client'
import { updateUserProfile } from '~/api/users'
import CityAutocompleteInput from '~/components/Inputs/CityAutocompleteInput.vue'
import CustomInput from '~/components/Inputs/CustomInput.vue'
import BaseModal from '~/components/Modals/BaseModal.vue'
import { isRussianCity } from '~/data/russian-cities'

const open = defineModel<boolean>('open', { required: true })

const { $toast } = useNuxtApp()

const { user, accessToken, updateProfile } = useUser()

const name = ref('')
const city = ref('')
const loading = ref(false)

function resetForm() {
  name.value = user.value?.name ?? ''
  city.value = user.value?.city ?? ''
}

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

function close() {
  open.value = false
}

async function onSubmit() {
  const trimmedName = name.value.trim()
  const trimmedCity = city.value.trim()

  if (!trimmedName) {
    $toast.error('Укажите имя', 'Имя видят клиенты в вашем профиле')
    return
  }

  if (!trimmedCity) {
    $toast.error('Выберите город из списка', 'Город нужен для подбора заявок и объявлений')
    return
  }

  if (!isRussianCity(trimmedCity)) {
    $toast.error('Выберите город из списка подсказок', 'Начните вводить и выберите город из списка')
    return
  }

  const token = accessToken.value
  if (!token) {
    $toast.error('Необходимо войти в аккаунт', 'Войдите снова и повторите попытку')
    return
  }

  loading.value = true

  try {
    const { user: updated } = await updateUserProfile(
      { name: trimmedName, city: trimmedCity },
      token,
    )
    updateProfile(updated)
    $toast.success('Настройки сохранены', 'Имя и город обновлены в профиле')
    window.setTimeout(() => {
      close()
    }, 700)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось сохранить — попробуйте позже')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" aria-label="Настройки профиля" @close="close">
    <section
      class="relative overflow-visible rounded-[2rem] profile-settings-modal max-md:rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] md:p-6"
    >
      <button
        type="button"
        class="modal-close-btn"
        aria-label="Закрыть"
        @click="close"
      >
        <X :size="18" :stroke-width="2" />
      </button>

      <span
        class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-mint-dark to-brand-mint-dark via-brand-mint px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#e8faf3]"
      >
        Настройки
      </span>

      <h4 class="mt-3 pr-8 text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
        Профиль
      </h4>
      <p class="mt-1 text-sm text-neutral-500">
        Имя и город отображаются в вашем профиле и помогают клиентам найти вас.
      </p>

      <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="text-sm font-semibold text-neutral-600">Имя</label>
          <CustomInput
            v-model="name"
            placeholder="Как к вам обращаться"
            container-class="mt-2"
            :disabled="loading"
          />
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

        <button
          type="submit"
          class="w-full rounded-lg bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e8faf3] transition hover:bg-brand-mint hover:text-[#1a1a1a] disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </form>
    </section>
  </BaseModal>
</template>
