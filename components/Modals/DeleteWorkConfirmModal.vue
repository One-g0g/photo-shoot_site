<script setup lang="ts">
import { Trash2, X } from '@lucide/vue'
import BaseModal from '~/components/Modals/BaseModal.vue'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  loading?: boolean
  workTitle?: string
}>()

const emit = defineEmits<{
  confirm: []
}>()

function close() {
  if (props.loading) return
  open.value = false
}

function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <BaseModal :open="!!open" aria-label="Удалить работу" @close="close">
    <section
      class="relative overflow-visible delete-work-confirm-modal rounded-[2rem] max-md:rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] md:p-6"
    >
      <button
        type="button"
        class="modal-close-btn"
        aria-label="Закрыть"
        :disabled="loading"
        @click="close"
      >
        <X :size="18" :stroke-width="2" />
      </button>

      <span
        class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-red-500 to-red-600 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white"
      >
        Удаление
      </span>

      <div class="mt-3 flex items-start gap-4 pr-8">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"
        >
          <Trash2 class="h-5 w-5" :stroke-width="2" />
        </div>

        <div class="min-w-0">
          <h4 class="text-[clamp(1.25rem,3vw,1.5rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
            Удалить работу?
          </h4>
          <p class="mt-2 text-sm text-neutral-500">
            <template v-if="workTitle">
              «{{ workTitle }}» будет удалена из портфолио без возможности восстановления.
            </template>
            <template v-else>
              Работа будет удалена из портфолио без возможности восстановления.
            </template>
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:gap-3 sm:flex-row-reverse sm:w-full">
        <button
          type="button"
          class="btn-main-outline w-full px-5 py-3 text-sm font-semibold sm:w-1/2 !rounded-lg !h-[46px]"
          :disabled="loading"
          @click="close"
        >
          Отмена
        </button>
        <button
          type="button"
          class="inline-flex w-full sm:w-1/2 h-[46px] items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="onConfirm"
        >
          {{ loading ? 'Удаление…' : 'Удалить' }}
        </button>
      </div>
    </section>
  </BaseModal>
</template>
