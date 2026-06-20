<script setup lang="ts">
import { X } from '@lucide/vue'
import { getApiErrorMessage } from '~/api/client'
import { normalizeMultilineText, resolveWorkImages, updateWork } from '~/api/works'
import CustomInput from '~/components/Inputs/CustomInput.vue'
import CustomTextarea from '~/components/Inputs/CustomTextarea.vue'
import WorkPhotosPicker from '~/components/Dropdowns/WorkPhotosPicker.vue'
import BaseModal from '~/components/Modals/BaseModal.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { WORK_CATEGORIES } from '~/data/work-categories'
import type { Work } from '~/api/works'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  work: Work | null
}>()

const emit = defineEmits<{
  updated: [work: Work]
}>()

const { $toast } = useNuxtApp()

const { accessToken } = useUser()

const title = ref('')
const description = ref('')
const category = ref('')
const photosPickerRef = ref<InstanceType<typeof WorkPhotosPicker> | null>(null)
const photosChanged = ref(false)
const initialPhotoUrls = ref<string[]>([])
const loading = ref(false)

function populateForm(work: Work) {
  title.value = work.title
  description.value = work.description ?? ''
  category.value = work.category
  photosChanged.value = false
  initialPhotoUrls.value = resolveWorkImages(work)
}

function resetForm() {
  title.value = ''
  description.value = ''
  category.value = ''
  photosChanged.value = false
  initialPhotoUrls.value = []
  photosPickerRef.value?.reset()
}

watch(
  () => [open.value, props.work] as const,
  ([isOpen, work]) => {
    if (isOpen && work) {
      populateForm(work)
    }
    if (!isOpen) {
      resetForm()
    }
  },
)

function close() {
  open.value = false
}

function onImageError(message: string) {
  $toast.error(message, 'Проверьте формат и размер файла')
}

function onPhotosChange() {
  photosChanged.value = true
}

async function onSubmit() {
  const work = props.work
  if (!work) return

  const trimmedTitle = title.value.trim()
  const trimmedCategory = category.value.trim()

  if (!trimmedTitle || !trimmedCategory) {
    $toast.error('Укажите название и выберите категорию', 'Эти поля обязательны для публикации')
    return
  }

  if (!photosPickerRef.value?.hasPhotos()) {
    $toast.error('Добавьте хотя бы одно фото', 'Можно загрузить до 3 изображений')
    return
  }

  const token = accessToken.value
  if (!token) {
    $toast.error('Необходимо войти в аккаунт', 'Войдите снова и повторите попытку')
    return
  }

  loading.value = true

  try {
    const files = photosChanged.value
      ? await photosPickerRef.value.collectFiles()
      : null

    const { work: updated } = await updateWork(
      work.id,
      {
        title: trimmedTitle,
        category: trimmedCategory,
        description: normalizeMultilineText(description.value),
      },
      token,
      files,
    )
    emit('updated', updated)
    close()
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Не удалось сохранить изменения — попробуйте позже')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="!!open && !!work" aria-label="Редактировать работу" @close="close">
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
        Портфолио
      </span>

      <h4 class="mt-3 pr-8 text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
        Редактировать работу
      </h4>
      <p class="mt-1 text-sm text-neutral-500">
        До 3 фото. Первое станет обложкой.
      </p>

      <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="text-sm font-semibold text-neutral-600">Фото</label>
          <WorkPhotosPicker
            ref="photosPickerRef"
            class="mt-2 block"
            :initial-preview-urls="initialPhotoUrls"
            :disabled="loading"
            @error="onImageError"
            @change="onPhotosChange"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-neutral-600">Название</label>
          <CustomInput
            v-model="title"
            type="text"
            placeholder="Например: Портрет в тени"
            container-class="mt-2"
            :disabled="loading"
          />
        </div>

        <div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-semibold text-neutral-600">Описание</label>
            <span class="text-xs tabular-nums text-neutral-400">
              {{ description.length }}/120
            </span>
          </div>
          <CustomTextarea
            v-model="description"
            placeholder="Коротко о работе…"
            container-class="mt-2"
            :max-length="120"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-neutral-600">Категория</label>
          <Select v-model="category" :disabled="loading">
            <SelectTrigger
              class="mt-2 !h-[46px] !w-full rounded-[14px] border border-[#d9dfdc] bg-[#f6f7f6] px-4 text-[16px] font-medium text-[var(--base-color)] shadow-none focus-visible:border-[#20d489] focus-visible:ring-0 data-[size=default]:!h-[46px]"
            >
              <SelectValue placeholder="Выберите категорию" />
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

        <button
          type="submit"
          class="w-full rounded-lg bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e8faf3] transition hover:bg-brand-mint hover:text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </form>
    </section>
  </BaseModal>
</template>
