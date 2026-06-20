<template>
    <div
        :class="[
            props.containerClass,
            surfaceContainerClass,
            disabled ? 'opacity-50' : ''
        ]"
        @click="focusInput"
        class="main_container_input cursor-text flex flex-row items-center w-full relative h-[46px] gap-3 rounded-[14px] px-4 transition-[color,background-color,outline-color] duration-200"
    >
        <component
            :is="props.icon"
            :class="[isFocused || modelValue.length > 0 ? 'active' : 'not_active', iconClass]"
            class="icon min-w-[22px] h-[22px] shrink-0 pointer-events-none"
        />
        <input
            ref="inputRef"
            autocomplete="off"
            :disabled="disabled"
            :value="modelValue"
            :id="id"
            @input="onInput"
            @beforeinput="onBeforeInput"
            @paste="onPaste"
            :maxlength="maxLength"
            :placeholder="placeholder"
            :class="[props.class]"
            class="h-full w-full bg-transparent text-[var(--base-color)] text-[16px] font-medium placeholder:text-[#7D7F8F]"
            :type="inputType"
            :inputmode="numeric ? 'decimal' : undefined"
            :pattern="numeric ? '[0-9.,]*' : undefined"
            @focus="isFocused = true"
            @blur="isFocused = false"
        />

        <button
            v-if="isPassword"
            :disabled="disabled"
            type="button"
            class="ml-auto cursor-pointer"
            @click.stop="togglePasswordVisibility"
        >
            <component
                :is="passwordIcon"
                :class="[showPassword ? 'active' : 'not_active', 'show_icon']"
                class="w-[18px] h-[18px]"
            />
        </button>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'
  
const props = defineProps<{
    modelValue: string;
    placeholder?: string;
    maxLength?: number;
    maxValue?: number;
    class?: string;
    id?: string;
    containerClass?: string;
    icon?: Component | string;
    type?: string;
    disabled?: boolean;
    numeric?: boolean;
    isPassword?: boolean;
    iconClass?: string;
    surface?: 'default' | 'muted';
  }>()

  const surfaceContainerClass = computed(() => {
    const outline = isFocused.value
      ? 'outline outline-1 outline-[#20d489]/60'
      : 'outline outline-1 outline-black/20'

    if (props.surface === 'muted') {
      return `!bg-neutral-100 ${outline}`
    }

    return isFocused.value
      ? `!bg-[#e7eeea] ${outline}`
      : `!bg-white ${outline}`
  })

  const isFocused = ref(false)
  const inputRef = ref<HTMLInputElement | null>(null)
  const emit = defineEmits(['update:modelValue'])

  const focusInput = () => {
    if(props.disabled) return
    isFocused.value = true
    inputRef.value?.focus()
  }

const numeric = computed(() => props.numeric === true)
const isPassword = computed(() => props.isPassword === true)
const showPassword = ref(false)

const inputType = computed(() => {
    if (isPassword.value) {
        return showPassword.value ? 'text' : 'password'
    }
    return props.type || 'text'
})

const passwordIcon = computed(() => (showPassword.value ? EyeOff : Eye))

const clampToMaxValue = (value: string) => {
  if (!numeric.value) return value
  if (typeof props.maxValue !== 'number') return value

  if (value === '' || value === '.') return value

  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return value

  if (parsed <= props.maxValue) return value
  return props.maxValue.toString()
}

function getInputElement(event: Event) {
  return event.target as HTMLInputElement
}

function writeInputValue(input: HTMLInputElement, value: string, cursorPosition = value.length) {
  input.value = value
  input.setSelectionRange(cursorPosition, cursorPosition)
}

  const onBeforeInput = (e: Event) => {
    const ie = e as unknown as InputEvent
    if (!numeric.value) return
    // @ts-ignore
    const inputType = (ie as any).inputType as string | undefined
    if (inputType && (inputType.startsWith('delete') || inputType === 'historyUndo' || inputType === 'historyRedo')) return
    
    // @ts-ignore
    const data: string | null = (ie as any).data ?? null
    if (!data) return

    const input = getInputElement(e)
    const currentValue = input.value
    const selectionStart = input.selectionStart ?? 0
    const selectionEnd = input.selectionEnd ?? 0
    
    if (/[0-9.,]/.test(data)) {
      if (data === ',') {
        e.preventDefault()
        let newValue = currentValue.slice(0, selectionStart) + '.' + currentValue.slice(selectionEnd)
        if (newValue.split('.').length > 2) {
          return
        }

        newValue = clampToMaxValue(newValue)
        writeInputValue(input, newValue)
        emit('update:modelValue', newValue)
        return
      }
      
      if (data === '.' || data === ',') {
        if (currentValue.includes('.') || currentValue.includes(',')) {
          const beforeSelection = currentValue.slice(0, selectionStart)
          const afterSelection = currentValue.slice(selectionEnd)
          if (beforeSelection.includes('.') || beforeSelection.includes(',') || 
              afterSelection.includes('.') || afterSelection.includes(',')) {
            e.preventDefault()
            return
          }
        }
      }
      
      return
    }
    
    e.preventDefault()
  }

  const onPaste = (e: ClipboardEvent) => {
    if (!numeric.value) return
    e.preventDefault()
    const input = getInputElement(e)
    const text = e.clipboardData?.getData('text') ?? ''
    const currentValue = input.value
    const selectionStart = input.selectionStart ?? 0
    const selectionEnd = input.selectionEnd ?? 0
    
    let sanitized = text.replace(/,/g, '.').replace(/[^0-9.]/g, '')
    
    const dotCount = sanitized.split('.').length - 1
    if (dotCount > 1) {
      const firstDotIndex = sanitized.indexOf('.')
      sanitized = sanitized.slice(0, firstDotIndex + 1) + sanitized.slice(firstDotIndex + 1).replace(/\./g, '')
    }
    
    const beforeSelection = currentValue.slice(0, selectionStart)
    const afterSelection = currentValue.slice(selectionEnd)
    const hasDotBefore = beforeSelection.includes('.')
    const hasDotAfter = afterSelection.includes('.')
    const hasDotInPaste = sanitized.includes('.')
    
    if ((hasDotBefore || hasDotAfter) && hasDotInPaste) {
      sanitized = sanitized.replace(/\./g, '')
    }
    
    let newValue = beforeSelection + sanitized + afterSelection
    
    const finalDotCount = newValue.split('.').length - 1
    if (finalDotCount > 1) {
      const firstDotIndex = newValue.indexOf('.')
      newValue = newValue.slice(0, firstDotIndex + 1) + newValue.slice(firstDotIndex + 1).replace(/\./g, '')
    }

    const clamped = clampToMaxValue(newValue)
    writeInputValue(input, clamped, selectionStart + sanitized.length)
    emit('update:modelValue', clamped)
  }

  const onInput = (e: Event) => {
    const input = getInputElement(e)
    const value = input.value
    if (!numeric.value) {
      emit('update:modelValue', value)
      return
    }
    
    let sanitized = value.replace(/,/g, '.')
    sanitized = sanitized.replace(/[^0-9.]/g, '')
    
    const dotCount = sanitized.split('.').length - 1
    if (dotCount > 1) {
      const firstDotIndex = sanitized.indexOf('.')
      sanitized = sanitized.slice(0, firstDotIndex + 1) + sanitized.slice(firstDotIndex + 1).replace(/\./g, '')
    }
    
    const clamped = clampToMaxValue(sanitized)
    input.value = clamped
    emit('update:modelValue', clamped)
  }

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
    focusInput()
}
  </script>
  
  
<style scoped>
 

    .icon.active{
        --input-color: #20D489 !important;
        
    }
    .icon.not_active{
        --input-color: #7D7F8F !important;
    }

    .show_icon.active{
        --show-color: #fff !important;
    }
    .show_icon.not_active{
        --show-color: #7D7F8F !important;
    }
 
</style>