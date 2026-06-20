<script setup lang="ts">
import { X } from '@lucide/vue'
import QuickSearchOrderForm from '~/components/QuickSearchOrderForm.vue'
import BaseModal from '~/components/Modals/BaseModal.vue'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  created: []
}>()

function close() {
  open.value = false
}

function onCreated() {
  emit('created')
  close()
}
</script>

<template>
  <BaseModal :open="open" aria-label="Быстрый поиск" @close="close">
    <div class="relative">
      <button
        type="button"
        class="modal-close-btn"
        aria-label="Закрыть"
        @click="close"
      >
        <X :size="18" :stroke-width="2" />
      </button>

      <QuickSearchOrderForm @created="onCreated" />
    </div>
  </BaseModal>
</template>
