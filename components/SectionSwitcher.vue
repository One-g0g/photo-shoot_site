<template>
    <div
        :class="[mainClass, fullWidth ? 'w-full' : 'w-fit max-w-full']"
        class="section-switcher relative h-[48px] min-h-[48px] p-[5px] px-[5px] rounded-[18px] border border-[var(--border-color)] overflow-hidden select-none overflow-x-auto invisible_scrollbar"
        :style="{
            backgroundColor: bgColor,
            cursor: containerCursor,
            '--switcher-active-color': activeTextColor,
            '--border-color': '#E0E0E0',
        }"
        ref="containerRef"
        @pointerdown="onContainerPointerDown"
        @pointermove="onPointerMove"
        @pointercancel="resetDragState"
    >
        <div
            :class="activeAreaClass"
            class="absolute top-[5px] left-0 h-[calc(100%-10px)] !rounded-[14px] transition-all duration-300 ease-out will-change-transform pointer-events-none"
            :style="indicatorStyle"
        />
        <div
            ref="flexContainerRef"
            class="flex flex-row relative z-10 h-full"
            :class="fullWidth ? 'w-full' : ''"
        >
            <div
                v-for="(item, index) in items"
                :key="index"
                ref="itemRefs"
                :class="[
                    containerClass,
                    activeItem === index ? 'active_item' : 'not_active_item',
                    fullWidth ? 'flex-1 w-full min-w-0' : 'min-w-fit shrink-0',
                ]"
                class="section-switcher-item gap-2 rounded-full px-4 h-[34px] max-md:!px-3 cursor-pointer flex items-center justify-center touch-manipulation"
                @pointerup="onItemPointerUp(index, $event)"
            >
                <Component v-if="item.icon && item.icon !== null" :is="item.icon" class="w-[20px] h-[20px]" />
                <p :class="textClass" class="text-[14px] font-[400] max-md:!text-[13px] !leading-[1] whitespace-nowrap">
                    {{ item.name }}
                </p>
            </div>
            <div v-if="hasScroll" :style="{ width: `${containerPaddingRight}px`, flexShrink: 0 }" />
        </div>
    </div>
</template>

<style scoped>
.active_item {
  --icon-color: var(--switcher-active-color, #FFFFFF);
  color: var(--switcher-active-color, #FFFFFF);
}

.not_active_item {
  --icon-color: #7D837E;
  color: #7D837E;
}

.section-switcher:not(.section-switcher--scrollable) {
  touch-action: manipulation;
}

.section-switcher--scrollable {
  touch-action: pan-x;
}
</style>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, onBeforeUnmount, type PropType } from 'vue'
import type { Component } from 'vue'

type SwitcherItem = {
    icon: Component | null
    name: string
}

const emit = defineEmits(['update:activeItem'])

const props = defineProps({
    items: {
        type: Array as PropType<SwitcherItem[]>,
        required: true,
    },
    mainClass: {
        type: String,
        required: false,
    },
    activeItem: {
        type: Number,
        required: true,
    },
    activeTextColor: {
        type: String,
        default: '#FFFFFF',
    },
    activeBgColor: {
        type: String,
        default: '#1ab874',
    },
    bgColor: {
        type: String,
        default: '#FFFFFF',
    },
    containerClass: {
        type: String,
        required: false,
    },
    textClass: {
        type: String,
        required: false,
    },
    activeAreaClass: {
        type: String,
        required: false,
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
})

const containerRef = ref<HTMLElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const indicatorStyle = reactive<Record<string, string>>({
    backgroundColor: props.activeBgColor,
    transform: 'translateX(0px)',
    width: '0px',
})

let resizeObserver: ResizeObserver | null = null

const hasScroll = ref(false)
const containerPaddingRight = ref(0)

const DRAG_THRESHOLD_PX = 10

const isDragging = ref(false)
const dragHappened = ref(false)
const activePointerId = ref<number | null>(null)
const startPointerX = ref(0)
const startScrollLeft = ref(0)

const containerCursor = computed(() => {
    if (!hasScroll.value) return 'default'
    return isDragging.value ? 'grabbing' : 'grab'
})

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function resetDragState() {
    isDragging.value = false
    dragHappened.value = false
    activePointerId.value = null
}

function onGlobalPointerUp(event: PointerEvent) {
    if (activePointerId.value !== null && event.pointerId === activePointerId.value) {
        resetDragState()
    }
}

const updateScrollState = () => {
    const container = containerRef.value
    if (!container) {
        hasScroll.value = false
        containerPaddingRight.value = 0
        return
    }

    hasScroll.value = container.scrollWidth > container.clientWidth
    container.classList.toggle('section-switcher--scrollable', hasScroll.value)

    if (hasScroll.value) {
        const containerStyle = window.getComputedStyle(container)
        containerPaddingRight.value = parseFloat(containerStyle.paddingRight) || 0
    } else {
        containerPaddingRight.value = 0
        container.scrollLeft = 0
    }
}

const scrollToActive = (behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.value
    const el = itemRefs.value[activeItem.value] as HTMLElement | undefined
    if (!container || !el || !hasScroll.value) return

    const cRect = container.getBoundingClientRect()
    const r = el.getBoundingClientRect()

    const leftInScroll = r.left - cRect.left + container.scrollLeft
    const centerInScroll = leftInScroll + r.width / 2
    const targetScrollLeft = centerInScroll - container.clientWidth / 2
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const nextScrollLeft = clamp(targetScrollLeft, 0, maxScrollLeft)

    if (Math.abs(container.scrollLeft - nextScrollLeft) < 1) return

    container.scrollTo({ left: nextScrollLeft, behavior })
}

function getIndicatorLeft(container: HTMLElement, el: HTMLElement) {
    const cRect = container.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const borderLeft = parseFloat(getComputedStyle(container).borderLeftWidth) || 0
    return Math.round(r.left - cRect.left - borderLeft + container.scrollLeft)
}

const recalc = () => {
    const container = containerRef.value
    const el = itemRefs.value[activeItem.value] as HTMLElement | undefined
    if (!container || !el) return

    updateScrollState()

    const left = getIndicatorLeft(container, el)
    const width = Math.round(el.getBoundingClientRect().width)
    indicatorStyle.backgroundColor = props.activeBgColor
    indicatorStyle.width = `${width}px`
    indicatorStyle.transform = `translateX(${left}px)`
}

const activeItem = ref(props.activeItem)

function selectItem(index: number) {
    if (index === activeItem.value) return
    emit('update:activeItem', index)
}

function onItemPointerUp(index: number, event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (dragHappened.value || isDragging.value) {
        resetDragState()
        return
    }
    selectItem(index)
}

function onContainerPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const container = containerRef.value
    if (!container) return

    activePointerId.value = event.pointerId
    startPointerX.value = event.clientX
    startScrollLeft.value = container.scrollLeft
    isDragging.value = false
    dragHappened.value = false
}

function onPointerMove(event: PointerEvent) {
    if (!hasScroll.value) return
    if (activePointerId.value !== event.pointerId) return

    const container = containerRef.value
    if (!container) return

    const deltaX = event.clientX - startPointerX.value

    if (!dragHappened.value && Math.abs(deltaX) < DRAG_THRESHOLD_PX) {
        return
    }

    if (!dragHappened.value) {
        dragHappened.value = true
        isDragging.value = true
        container.setPointerCapture(event.pointerId)
    }

    event.preventDefault()
    container.scrollLeft = startScrollLeft.value - deltaX
}

const handleResize = () => {
    recalc()
}

const handleScroll = () => {
    if (!isDragging.value) {
        recalc()
    }
}

onMounted(async () => {
    await nextTick()
    updateScrollState()
    scrollToActive('auto')
    recalc()
    window.addEventListener('resize', handleResize)
    window.addEventListener('pointerup', onGlobalPointerUp)
    window.addEventListener('pointercancel', onGlobalPointerUp)

    const container = containerRef.value
    if (container) {
        container.addEventListener('scroll', handleScroll)
        resizeObserver = new ResizeObserver(() => {
            recalc()
        })
        resizeObserver.observe(container)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('pointerup', onGlobalPointerUp)
    window.removeEventListener('pointercancel', onGlobalPointerUp)
    resizeObserver?.disconnect()

    const container = containerRef.value
    if (container) {
        container.removeEventListener('scroll', handleScroll)
    }
    resetDragState()
})

watch(() => props.activeItem, async (val) => {
    activeItem.value = val
    await nextTick()
    resetDragState()
    scrollToActive('smooth')
    recalc()
})

watch(() => props.activeBgColor, (color) => {
    indicatorStyle.backgroundColor = color
})

watch(() => props.items, async () => {
    await nextTick()
    updateScrollState()
    scrollToActive('auto')
    recalc()
})
</script>
