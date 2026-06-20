<script setup lang="ts">
import { ImagePlus, X } from '@lucide/vue'

export type WorkPhotoSlot = {
  preview: string
  file: File | null
  isExisting: boolean
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    maxPhotos?: number
    maxSizeBytes?: number
    initialPreviewUrls?: string[]
  }>(),
  {
    disabled: false,
    maxPhotos: 3,
    maxSizeBytes: 5 * 1024 * 1024,
    initialPreviewUrls: () => [],
  },
)

const emit = defineEmits<{
  error: [message: string]
  change: []
}>()

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const slots = ref<WorkPhotoSlot[]>([createEmptySlot()])
const dragOverIndex = ref<number | null>(null)
const dragDepthBySlot = ref<Record<number, number>>({})
const inputRefs = ref<(HTMLInputElement | null)[]>([])

function clearDragState() {
  dragOverIndex.value = null
  dragDepthBySlot.value = {}
}

function isFileDrag(event: DragEvent) {
  const types = event.dataTransfer?.types
  if (!types) return false
  return Array.from(types).includes('Files')
}

function createEmptySlot(): WorkPhotoSlot {
  return { preview: '', file: null, isExisting: false }
}

function revokeBlobPreview(preview: string) {
  if (preview.startsWith('blob:')) {
    URL.revokeObjectURL(preview)
  }
}

function filledCount() {
  return slots.value.filter((slot) => slot.preview).length
}

function syncTrailingEmptySlot() {
  const filled = filledCount()
  slots.value = slots.value.filter((slot) => slot.preview)

  if (filled < props.maxPhotos) {
    slots.value.push(createEmptySlot())
  }
}

function setInputRef(index: number, element: HTMLInputElement | null) {
  inputRefs.value[index] = element
}

function openPicker(index: number) {
  if (props.disabled) return
  inputRefs.value[index]?.click()
}

function validateFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    emit('error', 'Допустимы только JPG, PNG или WebP')
    return false
  }

  if (file.size > props.maxSizeBytes) {
    emit('error', 'Файл больше 5 МБ')
    return false
  }

  return true
}

function applyPhoto(index: number, file: File) {
  if (!validateFile(file)) return

  const slot = slots.value[index]
  if (slot?.preview) {
    revokeBlobPreview(slot.preview)
  }

  slots.value[index] = {
    preview: URL.createObjectURL(file),
    file,
    isExisting: false,
  }

  emit('change')
  syncTrailingEmptySlot()
}

function onPhotoSelected(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) applyPhoto(index, file)
}

function onDragEnter(index: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (props.disabled || !isFileDrag(event)) return

  const depth = (dragDepthBySlot.value[index] ?? 0) + 1
  dragDepthBySlot.value = { ...dragDepthBySlot.value, [index]: depth }
  dragOverIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (props.disabled || !isFileDrag(event)) return

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }

  dragOverIndex.value = index
}

function onSlotDragLeave(index: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  const currentTarget = event.currentTarget
  const related = event.relatedTarget
  if (currentTarget instanceof HTMLElement && related instanceof Node && currentTarget.contains(related)) {
    return
  }

  const depth = (dragDepthBySlot.value[index] ?? 1) - 1
  if (depth <= 0) {
    const next = { ...dragDepthBySlot.value }
    delete next[index]
    dragDepthBySlot.value = next
    if (dragOverIndex.value === index) {
      dragOverIndex.value = null
    }
    return
  }

  dragDepthBySlot.value = { ...dragDepthBySlot.value, [index]: depth }
}

function onDrop(index: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  clearDragState()
  if (props.disabled) return

  const file = event.dataTransfer?.files?.[0]
  if (file) applyPhoto(index, file)
}

function removeSlot(index: number) {
  const slot = slots.value[index]
  if (!slot) return

  revokeBlobPreview(slot.preview)
  slots.value.splice(index, 1)

  if (!slots.value.length) {
    slots.value = [createEmptySlot()]
    emit('change')
    return
  }

  syncTrailingEmptySlot()
  emit('change')
}

function setInitialPreviewUrls(urls: string[]) {
  reset()

  const initial = urls
    .filter(Boolean)
    .slice(0, props.maxPhotos)
    .map<WorkPhotoSlot>((preview) => ({
      preview,
      file: null,
      isExisting: true,
    }))

  slots.value = initial.length ? initial : [createEmptySlot()]
  syncTrailingEmptySlot()
}

function reset() {
  for (const slot of slots.value) {
    revokeBlobPreview(slot.preview)
  }

  slots.value = [createEmptySlot()]
  clearDragState()
  inputRefs.value = []
  appliedPreviewKey = ''
}

let appliedPreviewKey = ''

watch(
  () => props.initialPreviewUrls.join('\0'),
  (key) => {
    if (key === appliedPreviewKey) return
    appliedPreviewKey = key
    setInitialPreviewUrls(props.initialPreviewUrls)
  },
  { immediate: true },
)

async function collectFiles(): Promise<File[]> {
  const files: File[] = []

  for (const slot of slots.value) {
    if (!slot.preview) continue

    if (slot.file) {
      files.push(slot.file)
      continue
    }

    if (slot.isExisting) {
      const response = await fetch(slot.preview)
      const blob = await response.blob()
      files.push(new File([blob], `photo-${files.length + 1}.webp`, { type: blob.type || 'image/webp' }))
    }
  }

  return files
}

function hasPhotos() {
  return filledCount() > 0
}

defineExpose({
  reset,
  setInitialPreviewUrls,
  collectFiles,
  hasPhotos,
})

onMounted(() => {
  window.addEventListener('dragend', clearDragState)
})

onUnmounted(() => {
  window.removeEventListener('dragend', clearDragState)
  reset()
})
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(slot, index) in slots"
      :key="index"
      class="relative"
    >
      <input
        :ref="(element) => setInputRef(index, element as HTMLInputElement | null)"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        :disabled="disabled"
        @change="onPhotoSelected(index, $event)"
      >

      <p
        class="mb-2 text-xs font-medium text-neutral-400"
      >
        Фото {{ index + 1 }}
      </p>

      <button
        v-if="!slot.preview"
        type="button"
        class="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40"
        :class="dragOverIndex === index
          ? 'border-brand-mint bg-brand-mint-light/40'
          : 'border-black/10 bg-[#f6f7f6] hover:border-black/20 hover:bg-neutral-50'"
        :disabled="disabled"
        @click="openPicker(index)"
        @dragenter="onDragEnter(index, $event)"
        @dragover="onDragOver(index, $event)"
        @dragleave="onSlotDragLeave(index, $event)"
        @drop="onDrop(index, $event)"
      >
        <ImagePlus class="h-10 w-10 text-neutral-300 transition duration-300 group-hover:text-black" :stroke-width="1.25" />
        <p class="mt-3 text-sm font-semibold text-neutral-700">
          {{ index === 0 ? 'Добавьте фото' : `Добавьте фото ${index + 1}` }}
        </p>
        <p class="mt-1 text-xs text-neutral-500">
          JPG, PNG или WebP, до 5 МБ
        </p>
        <p class="mt-1 text-xs text-neutral-400">
          Нажмите или перетащите файл
        </p>
      </button>

      <div
        v-else
        class="group relative overflow-hidden rounded-2xl border transition"
        :class="dragOverIndex === index
          ? 'border-brand-mint ring-2 ring-brand-mint/40'
          : 'border-black/10'"
        @dragenter="onDragEnter(index, $event)"
        @dragover="onDragOver(index, $event)"
        @dragleave="onSlotDragLeave(index, $event)"
        @drop="onDrop(index, $event)"
      >
        <div
          class="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-brand-mint/25 transition-opacity duration-150"
          :class="dragOverIndex === index ? 'opacity-100' : 'opacity-0'"
        >
          <p class="rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            Отпустите для замены
          </p>
        </div>

        <img
          :src="slot.preview"
          alt="Превью"
          class="max-h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          draggable="false"
        >

        <button
          type="button"
          class="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/0 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:pointer-events-auto group-hover:bg-black/35 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/40"
          :disabled="disabled"
          aria-label="Заменить фото"
          @click="openPicker(index)"
        >
          Заменить
        </button>

        <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2">
          <span
            v-if="index === 0"
            class="rounded-full bg-brand-mint/75 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
          >
            Обложка
          </span>
          <span v-else class="flex-1" />

          <button
            type="button"
            class="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
            :disabled="disabled"
            aria-label="Удалить фото"
            @click.stop="removeSlot(index)"
          >
            <X :size="16" :stroke-width="2" />
          </button>
        </div>
      </div>
    </div>

    <p class="text-xs text-neutral-400">
      Можно добавить до {{ maxPhotos }} фото. Первое фото станет обложкой.
    </p>
  </div>
</template>
