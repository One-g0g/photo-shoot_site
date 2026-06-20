<script setup lang="ts">
import Backdrop from '~/components/Modals/Backdrop.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    ariaLabel?: string
  }>(),
  {
    ariaLabel: 'Диалог',
  },
)

const emit = defineEmits<{
  close: []
}>()

const { lock, unlock } = useScrollLock()

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return

    if (isOpen) {
      lock()
    } else {
      unlock()
    }
  },
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client && props.open) {
    unlock()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="modal-root fixed inset-0 z-[200] overflow-hidden overscroll-none"
      >
        <Backdrop @click="emit('close')" />

        <div
          class="modal-scroll fixed inset-0 z-10 overflow-y-auto overscroll-contain"
          data-scroll-lock-scroll
          @click.self="emit('close')"
        >
          <div class="relative flex min-h-full items-center justify-center px-2 pt-8 pb-6 md:px-0">
            <div
              role="dialog"
              aria-modal="true"
              :aria-label="ariaLabel"
              class="relative modal-content z-10 w-full max-w-lg"
              @click.stop
            >
              <slot />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>


@reference '~/assets/globals.css';
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.modal-content:has(.delete-work-confirm-modal),
.modal-content:has(.profile-settings-modal) {
  @apply !max-w-md;
}
</style>
