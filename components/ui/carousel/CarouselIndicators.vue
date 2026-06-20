<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCarousel } from './useCarousel'
import { cn } from '@/lib/utils'

interface CarouselIndicatorsProps {
  class?: string
  indicatorClass?: string
  activeIndicatorClass?: string
  inactiveIndicatorClass?: string
}

const props = defineProps<CarouselIndicatorsProps>()

const { carouselApi } = useCarousel()

const slides = ref<HTMLElement[]>([])
const selectedIndex = ref(0)

function updateSlides() {
  if (!carouselApi.value) return
  const slideNodes = carouselApi.value.slideNodes()
  slides.value = slideNodes
}

function updateSelectedIndex() {
  if (!carouselApi.value) return
  const newIndex = carouselApi.value.selectedScrollSnap()
  selectedIndex.value = newIndex
}

function scrollTo(index: number) {
  if (!carouselApi.value) return
  carouselApi.value.scrollTo(index)
}

onMounted(() => {
  
  // Ждем немного, чтобы carouselApi инициализировался
  setTimeout(() => {
    if (!carouselApi.value) {
      return
    }
    
    
    // Инициализация
    updateSlides()
    updateSelectedIndex()
    
    // Подписка на события
    carouselApi.value.on('init', () => {
      updateSlides()
      updateSelectedIndex()
    })
    
    carouselApi.value.on('reInit', () => {
      updateSlides()
      updateSelectedIndex()
    })
    
    carouselApi.value.on('select', () => {
      updateSelectedIndex()
    })
  }, 100)
})

onUnmounted(() => {
  if (!carouselApi.value) return
  
  // Отписка от событий
  carouselApi.value.off('init', updateSlides)
  carouselApi.value.off('reInit', updateSlides)
  carouselApi.value.off('select', updateSelectedIndex)
})
</script>

<template>
  <div :class="cn('flex h-3 items-center justify-center gap-2 pt-4', props.class)">
    <button
      v-for="(_, index) in slides"
      :key="index"
      type="button"
      :class="cn(
        'rounded-full transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.28)]',
        selectedIndex === index
          ? cn(
            'size-2.5 bg-neutral-100 ring-2 ring-neutral-400/55 ring-offset-1 ring-offset-black/30',
            props.activeIndicatorClass,
          )
          : cn(
            'size-1.5 bg-neutral-100/90 ring-1 ring-neutral-300/70',
            props.inactiveIndicatorClass,
          ),
        props.indicatorClass,
      )"
      :aria-label="`Перейти к фото ${index + 1}`"
      :aria-current="selectedIndex === index ? 'true' : undefined"
      @click="scrollTo(index)"
    />
  </div>
</template>
