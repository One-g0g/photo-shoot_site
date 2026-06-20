<template>
  <div
    :class="[
      props.containerClass,
      isFocused ? '!bg-[#eef1ef] !outline-[#20d489]' : '!bg-[#f6f7f6]',
      disabled ? 'opacity-50' : '',
    ]"
    class="main_container_input cursor-text w-full relative px-[16px] py-[12px] rounded-[14px] outline outline-[1px] outline-[#d9dfdc] transition-colors duration-200"
    @click="focusTextarea"
  >
    <textarea
      ref="textareaRef"
      autocomplete="off"
      :disabled="disabled"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength ?? undefined"
      :rows="rows"
      :class="[props.class, minHeightClass]"
      class="w-full bg-transparent text-[var(--base-color)] text-[16px] font-[500] placeholder:text-[#7D7F8F] resize-none outline-none"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    class?: string
    containerClass?: string
    disabled?: boolean
    maxLength?: number
    rows?: number
    minHeightClass?: string
  }>(),
  {
    rows: 3,
    minHeightClass: 'min-h-[5.5rem]',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function focusTextarea() {
  if (props.disabled) return
  isFocused.value = true
  textareaRef.value?.focus()
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>
