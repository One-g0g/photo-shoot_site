<script setup lang="ts">
import { X } from '@lucide/vue'
import CustomTextarea from '~/components/Inputs/CustomTextarea.vue'
import BaseModal from '~/components/Modals/BaseModal.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const open = defineModel<boolean>('open', { required: true })

const supportReasons = [
  { value: 'login', label: 'Не могу войти в аккаунт' },
  { value: 'upload', label: 'Проблема с загрузкой фото' },
  { value: 'bug', label: 'Ошибка или сбой на сайте' },
  { value: 'account', label: 'Вопрос по профилю или настройкам' },
  { value: 'other', label: 'Другое' },
] as const

const { $toast } = useNuxtApp()

const reason = ref<string | undefined>()
const description = ref('')
const loading = ref(false)

function resetForm() {
  reason.value = undefined
  description.value = ''
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
  if (!reason.value) {
    $toast.error('Выберите тему обращения', 'Выберите подходящий пункт из списка')
    return
  }

  const trimmedDescription = description.value.trim()
  if (!trimmedDescription) {
    $toast.error('Опишите проблему', 'Расскажите подробнее, что произошло')
    return
  }

  loading.value = true

  await new Promise((resolve) => {
    window.setTimeout(resolve, 900)
  })

  $toast.success(
    'Обращение отправлено',
    'Мы свяжемся с вами по email из профиля',
  )
  loading.value = false
  close()
}
</script>

<template>
  <BaseModal :open="open" aria-label="Помощь и поддержка" @close="close">
    <section
      class="relative overflow-visible rounded-[2rem] max-md:rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] md:p-6"
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
        Поддержка
      </span>

      <h4 class="mt-3 pr-8 text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
        Помощь
      </h4>
      <p class="mt-1 text-sm text-neutral-500">
        Опишите проблему — мы передадим обращение в поддержку Photo Shoot.
      </p>

      <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="text-sm font-semibold text-neutral-600">Тема обращения</label>
          <Select v-model="reason" :disabled="loading">
            <SelectTrigger
              class="mt-2 !h-[46px] !w-full rounded-[14px] border border-[#d9dfdc] bg-[#f6f7f6] px-4 text-[16px] font-medium text-[var(--base-color)] shadow-none focus-visible:border-[#20d489] focus-visible:ring-0 data-[size=default]:!h-[46px]"
            >
              <SelectValue placeholder="Выберите причину" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              :side-offset="4"
              class="z-[250] w-[var(--reka-select-trigger-width)] min-w-[var(--reka-select-trigger-width)] rounded-[14px] border border-[#d9dfdc] bg-white shadow-lg"
            >
              <SelectItem
                v-for="item in supportReasons"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-semibold text-neutral-600">Описание</label>
            <span class="text-xs tabular-nums text-neutral-400">
              {{ description.length }}/300
            </span>
          </div>
          <CustomTextarea
            v-model="description"
            placeholder="Расскажите, что произошло и что вы уже пробовали сделать…"
            container-class="mt-2"
            :max-length="300"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-lg bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e8faf3] transition hover:bg-brand-mint hover:text-[#1a1a1a] disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Отправка…' : 'Отправить' }}
        </button>
      </form>
    </section>
  </BaseModal>
</template>
