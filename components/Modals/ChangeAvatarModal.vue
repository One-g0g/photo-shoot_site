<script setup lang="ts">
import { Camera, X } from '@lucide/vue'
import BaseModal from '~/components/Modals/BaseModal.vue'

const open = defineModel<boolean>('open', { required: true })

const {
  user,
  userAvatar,
  avatarInputRef,
  loading,
  openFilePicker,
  onFileSelected,
} = useAvatarUpload()

function close() {
  open.value = false
}
</script>

<template>
  <BaseModal :open="open" aria-label="Изменить аватар" @close="close">
    <section
      class="relative overflow-visible rounded-[2rem] max-md:rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] md:p-6"
    >
      <button
        type="button"
        class="modal-close-btn"
        aria-label="Закрыть"
        @click="close"
      >
        <X :size="18" :stroke-width="2" />
      </button>

      <span
        class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-mint-dark to-brand-mint-dark via-brand-mint px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#e8faf3]"
      >
        Аватар
      </span>

      <h4 class="mt-3 pr-8 text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
        Изменить фото профиля
      </h4>
      <p class="mt-1 text-sm text-neutral-500">
        Загрузите изображение — оно появится в шапке и в личном кабинете.
      </p>

      <div class="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <button
          type="button"
          class="avatar-picker group relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-neutral-200/80 transition duration-200 hover:ring-brand-mint/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint/50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          aria-label="Выбрать фото аватара"
          @click="openFilePicker"
        >
          <img
            :src="userAvatar"
            :alt="user?.name ?? 'Аватар'"
            class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          >
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100"
            aria-hidden="true"
          >
            <Camera class="text-white" :size="28" :stroke-width="1.75" />
          </span>
        </button>

        <div class="min-w-0 flex-1 text-center sm:text-left">
          <p class="text-sm text-neutral-600">
            JPG, PNG или WebP, до 2 МБ.
          </p>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="sr-only"
            :disabled="loading"
            @change="onFileSelected"
          >
          <button
            type="button"
            class="mt-3 w-full rounded-lg bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e8faf3] transition hover:bg-brand-mint hover:text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="loading"
            @click="openFilePicker"
          >
            {{ loading ? 'Загрузка…' : 'Выбрать фото' }}
          </button>
        </div>
      </div>

      <p class="mt-5 text-center text-xs text-[#1a1a1a]/45">
        Пожалуйста, не загружайте изображения с непристойным содержанием или оскорбительного характера.
      </p>
    </section>
  </BaseModal>
</template>
