<script setup lang="ts">
import { ImagePlus } from '@lucide/vue'

const photoFile = defineModel<File | null>({ default: null })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    maxSizeBytes?: number
    initialPreviewUrl?: string
  }>(),
  {
    disabled: false,
    maxSizeBytes: 5 * 1024 * 1024,
    initialPreviewUrl: '',
  },
)

const emit = defineEmits<{
  error: [message: string]
}>()

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const photoPreview = ref('')
const photoInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const displayPreview = computed(
  () => photoPreview.value || props.initialPreviewUrl || '',
)

function clearPhoto() {
  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value)
  }
  photoFile.value = null
  photoPreview.value = ''
}

function openPhotoPicker() {
  if (props.disabled) return
  photoInputRef.value?.click()
}

function applyPhoto(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    emit('error', 'Допустимы только JPG, PNG или WebP')
    return
  }

  if (file.size > props.maxSizeBytes) {
    emit('error', 'Файл больше 5 МБ')
    return
  }

  clearPhoto()
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) applyPhoto(file)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (props.disabled) return
  isDragOver.value = true
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  if (props.disabled) return

  const file = event.dataTransfer?.files?.[0]
  if (file) applyPhoto(file)
}

watch(photoFile, (file) => {
  if (!file && photoPreview.value) {
    clearPhoto()
  }
})

function reset() {
  clearPhoto()
  isDragOver.value = false
}

defineExpose({ reset })

onUnmounted(() => {
  clearPhoto()
})
</script>

<template>
  <div>
    <input
      ref="photoInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="sr-only"
      :disabled="disabled"
      @change="onPhotoSelected"
    >

    <button
      v-if="!displayPreview"
      type="button"
      class="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40"
      :class="isDragOver
        ? 'border-brand-mint bg-brand-mint-light/40'
        : 'border-black/10 bg-[#f6f7f6] hover:border-black/20 hover:bg-neutral-50'"
      :disabled="disabled"
      @click="openPhotoPicker"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <ImagePlus class="h-14 w-14 text-neutral-300 group-hover:text-black transition duration-300" :stroke-width="1.25" />
      <p class="mt-4 text-sm font-semibold text-neutral-700">
        Добавьте фото
      </p>
      <p class="mt-1 text-xs text-neutral-500">
        JPG, PNG или WebP, до 5 МБ
      </p>
      <p class="mt-1 text-xs text-neutral-400">
        Нажмите или перетащите файл
      </p>
    </button>

    <button
      v-else
      type="button"
      class="group relative block h-auto max-h-64 w-full overflow-hidden rounded-2xl border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40"
      :disabled="disabled"
      aria-label="Заменить фото"
      @click="openPhotoPicker"
    >
      <img
        :src="displayPreview"
        alt="Превью"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      >
      <span
        class="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-semibold text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100"
      >
        Заменить фото
      </span>
    </button>
  </div>
</template>
