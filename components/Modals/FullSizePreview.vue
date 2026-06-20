<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[200] overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-black/90"
          aria-hidden="true"
          @click="requestClose"
        />

        <div
          class="preview-shell relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 px-0 py-4 md:p-10 pointer-events-none"
          @click.stop
        >
          <div class="preview-main relative flex w-full flex-col items-center pointer-events-auto">
            <Carousel
              :opts="{ align: 'center', loop: true }"
              class="preview-carousel relative flex w-full flex-col items-center"
              @init-api="handleModalInit"
            >
              <CarouselContent class="preview-carousel-content -ml-0 w-full items-center">
                <CarouselItem
                  v-for="(screenshot, idx) in screenshots"
                  :key="idx"
                  class="preview-carousel-item flex items-center justify-center pl-0"
                >
                  <div class="preview-main-slide relative">
                    <img
                      :src="screenshot.src"
                      class="preview-main-img select-none"
                      draggable="false"
                    >
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselIndicators class="indicators_container !pt-0" />

              <div
                v-if="screenshots.length > 1"
                class="preview-thumbs pointer-events-auto flex max-w-full flex-row gap-3 overflow-x-auto invisible_scrollbar max-h-820-hidden"
              >
                <img
                  v-for="(screenshot, idx) in screenshots"
                  :key="idx"
                  :src="screenshot.src"
                  :class="index === idx ? '!border-brand-mint !opacity-100' : 'border-transparent opacity-50'"
                  class="preview-thumb base-transition h-[100px] w-[160px] shrink-0 cursor-pointer rounded-[14px] border-2 object-cover hover:opacity-100 max-md:h-[80px] max-md:w-[128px] max-sm:h-[50px] max-sm:w-[80px]"
                  @click="goToSlide(idx)"
                >
              </div>
            </Carousel>
          </div>

          <button
            type="button"
            class="close_button pointer-events-auto absolute top-4 right-4 z-[1300] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition hover:bg-black max-md:h-8 max-md:w-8"
            aria-label="Закрыть"
            @click="requestClose"
          >
            <X class="h-5 w-5 text-white/70 transition hover:text-white max-md:h-[18px] max-md:w-[18px]" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.indicators_container {
  display: none;
  flex: 0 0 auto;
  justify-content: center;
  align-items: center;
  margin-top: 0.625rem;
  padding-top: 0;
}

.preview-thumbs {
  flex: 0 0 auto;
  justify-content: center;
  margin-top: 0.625rem;
  padding: 0 1rem 0.25rem;
  max-width: min(96vw, 1520px);
}

.preview-main {
  flex: 1 1 auto;
  min-height: 0;
  justify-content: center;
}

.preview-carousel {
  height: auto;
}

.preview-carousel-content {
  flex: 0 0 auto;
  height: auto;
}

.preview-carousel-item {
  height: auto;
}

.preview-main-slide {
  overflow: hidden;
  width: 100vw;
  max-width: 100vw;
  height: 75vh;
  max-height: 75vh;
}

.preview-main,
.preview-carousel {
  width: 100vw;
  max-width: 100vw;
}

.preview-main-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

@media (min-width: 768px) {
  .preview-shell {
    gap: 0;
  }

  .preview-main {
    width: min(96vw, 1520px);
    max-width: min(96vw, 1520px);
  }

  .preview-carousel {
    width: 100%;
    max-width: 100%;
  }

  .preview-main-slide {
    width: min(96vw, 1520px);
    max-width: min(96vw, 1520px);
    height: min(86vh, calc(100dvh - 7.5rem));
    max-height: min(86vh, calc(100dvh - 7.5rem));
  }

  .preview-thumb {
    height: 68px;
    width: 108px;
  }
}

@media (min-height: 821px) {
  .preview-shell {
    justify-content: center;
    gap: 0;
  }

  .preview-main {
    flex: 0 0 auto;
    min-height: unset;
  }

  .preview-carousel {
    height: auto;
  }

  .preview-carousel-content {
    height: auto;
    flex: 0 0 auto;
  }

  .preview-carousel-item {
    height: auto;
  }
}

@media (max-height: 820px) {
  .preview-shell {
    height: 100dvh;
    justify-content: center;
  }

  .preview-main {
    flex: 0 0 auto;
    min-height: unset;
  }

  .preview-main-slide {
    height: auto;
    max-height: calc(100dvh - 5.5rem);
  }

  .preview-main-img {
    width: 100vw;
    height: auto;
    max-height: calc(100dvh - 5.5rem);
  }

  .close_button {
    width: 32px;
    height: 32px;
  }

  .indicators_container {
    display: flex;
  }

  .max-h-820-hidden {
    display: none;
  }
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
} from '~/components/ui/carousel'

export interface Screenshot {
  src: string
}

const props = defineProps<{
  modelValue: boolean
  screenshots: Screenshot[]
  index: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'update:index', v: number): void
  (e: 'close'): void
}>()

const { lock, unlock } = useScrollLock()
const modalCarouselApi = ref<any>(null)

const requestClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const goToSlide = (idx: number) => {
  modalCarouselApi.value?.scrollTo(idx)
}

const handleModalInit = (api: any) => {
  if (!api) return

  modalCarouselApi.value = api
  api.scrollTo(props.index)

  api.on('select', () => {
    emit('update:index', api.selectedScrollSnap())
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) {
    requestClose()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!import.meta.client) return

    if (open) {
      lock()
    } else {
      unlock()
    }

    if (open && modalCarouselApi.value) {
      modalCarouselApi.value.scrollTo(props.index)
    }
  },
)

watch(
  () => props.index,
  (idx) => {
    if (props.modelValue && modalCarouselApi.value) {
      modalCarouselApi.value.scrollTo(idx)
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client && props.modelValue) {
    unlock()
  }
})
</script>
