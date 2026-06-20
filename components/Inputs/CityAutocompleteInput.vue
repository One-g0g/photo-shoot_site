<script setup lang="ts">
import { searchRussianCities } from '~/data/russian-cities'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  containerClass?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const listOpen = ref(false)
const activeIndex = ref(-1)

const suggestions = computed(() => searchRussianCities(props.modelValue))

const showSuggestions = computed(
  () => listOpen.value && isFocused.value && suggestions.value.length > 0 && !props.disabled,
)

function focusInput() {
  if (props.disabled) return
  isFocused.value = true
  listOpen.value = true
  inputRef.value?.focus()
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  listOpen.value = true
  activeIndex.value = -1
}

function selectCity(city: string) {
  emit('update:modelValue', city)
  listOpen.value = false
  activeIndex.value = -1
  inputRef.value?.blur()
}

function onBlur() {
  window.setTimeout(() => {
    isFocused.value = false
    listOpen.value = false
    activeIndex.value = -1
  }, 120)
}

function onKeydown(event: KeyboardEvent) {
  if (!showSuggestions.value) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, suggestions.value.length - 1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }

  if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    const city = suggestions.value[activeIndex.value]
    if (city) selectCity(city)
    return
  }

  if (event.key === 'Escape') {
    listOpen.value = false
    activeIndex.value = -1
  }
}

onMounted(() => {
  const onDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node | null
    if (rootRef.value && target && !rootRef.value.contains(target)) {
      listOpen.value = false
    }
  }

  document.addEventListener('click', onDocumentClick)
  onUnmounted(() => document.removeEventListener('click', onDocumentClick))
})
</script>

<template>
  <div ref="rootRef" :class="props.containerClass" class="relative w-full">
    <div
      :class="[
        isFocused ? '!bg-[#eef1ef] !outline-[#20d489]' : '!bg-[#f6f7f6]',
        disabled ? 'opacity-50' : '',
      ]"
      class="main_container_input cursor-text flex flex-row items-center w-full relative h-[46px] px-[16px] gap-3 rounded-[14px] outline outline-[1px] outline-[#d9dfdc] transition-colors duration-200"
      @click="focusInput"
    >
      <input
        ref="inputRef"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="showSuggestions"
        :disabled="disabled"
        :value="modelValue"
        :placeholder="placeholder"
        class="h-full w-full bg-transparent text-[var(--base-color)] text-[16px] font-[500] placeholder:text-[#7D7F8F]"
        @input="onInput"
        @focus="isFocused = true; listOpen = true"
        @blur="onBlur"
        @keydown="onKeydown"
      >
    </div>

    <ul
      v-if="showSuggestions"
      class="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[260] max-h-56 overflow-y-auto rounded-[8px] border border-[#d9dfdc] bg-white py-0  shadow-lg"
      role="listbox"
    >
      <li
        v-for="(city, index) in suggestions"
        :key="city"
        role="option"
        :aria-selected="index === activeIndex"
        class="cursor-pointer px-4 py-2.5 text-sm text-brand-text transition hover:bg-brand-mint-light"
        :class="{ 'bg-brand-mint-light text-brand-mint-dark': index === activeIndex }"
        @mousedown.prevent="selectCity(city)"
      >
        {{ city }}
      </li>
    </ul>
  </div>
</template>
