<script setup lang="ts">
import type { SelectTriggerProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<
    SelectTriggerProps & {
      class?: HTMLAttributes['class']
      size?: 'sm' | 'default'
      variant?: 'default' | 'muted'
    }
  >(),
  { size: 'default', variant: 'default' },
)

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant')
const forwardedProps = useForwardProps(delegatedProps)

const triggerClass = computed(() =>
  cn(
    'group data-placeholder:text-muted-foreground gap-1.5 py-2 pr-2 pl-2.5 text-sm transition-[color,background-color,outline-color] select-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*=size-])]:size-4 flex items-center justify-between whitespace-nowrap *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
    props.variant === 'default' && [
      'border-input dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border bg-transparent focus-visible:ring-3 aria-invalid:ring-3 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] w-fit outline-none',
    ],
    props.variant === 'muted' && [
      'w-full rounded-[12px] border-0 bg-neutral-100 px-3 text-[16px] font-normal text-brand-text shadow-none outline outline-1 outline-black/20 focus-visible:ring-0 data-[state=open]:outline-[#20d489]/60 data-[size=default]:!h-[42px]',
    ],
    props.class,
  ),
)
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="triggerClass"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDownIcon class="text-muted-foreground size-4 pointer-events-none transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </SelectIcon>
  </SelectTrigger>
</template>
