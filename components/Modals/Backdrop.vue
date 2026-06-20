<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm"
    aria-hidden="true"
    @click="emit('click')"
  />
</template>