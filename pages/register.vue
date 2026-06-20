<script setup lang="ts">
import { getApiErrorMessage } from '~/api/client'
import CustomInput from '~/components/Inputs/CustomInput.vue'

definePageMeta({
  layout: 'auth',
})

useHead({ title: 'Регистрация' })

const { $toast } = useNuxtApp()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const { registerAccount, isLoggedIn, cabinetPath } = useUser()

async function onSubmit() {
  if (!name.value.trim() || !email.value.trim() || password.value.length < 8) return

  loading.value = true

  try {
    await registerAccount({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })
    await navigateTo(cabinetPath.value)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Проверьте данные или попробуйте другой email')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo(cabinetPath.value)
  }
})
</script>

<template>
  <div class="flex flex-1 items-center py-10 auth-page">
    <div class="site-container mx-auto w-full !max-w-lg max-md:!px-[8px]">

      <section
        class="relative mt-8 rounded-[2rem]  max-md:rounded-3xl max-md:max-w-[440px] mx-auto border border-neutral-200/90 bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] md:p-6"
      >
        <span
          class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1a1a1a] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#e8faf3]"
        >
          Регистрация
        </span>

        <h1 class="mt-3 text-[clamp(1.7rem,4vw,2rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
          Создать аккаунт
        </h1>
        <p class="mt-1 text-sm text-neutral-500">
          Быстрый вход в платформу: роль можно переключить в личном кабинете.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="text-sm font-semibold text-neutral-600">Имя</label>
            <CustomInput
              v-model="name"
              type="text"
              placeholder="Как к вам обращаться"
              container-class="mt-2"
              :disabled="loading"
            />
          </div>
          <div>
            <label class="text-sm font-semibold text-neutral-600">Email</label>
            <CustomInput
              v-model="email"
              type="email"
              placeholder="name@example.com"
              container-class="mt-2"
              :disabled="loading"
            />
          </div>
          <div>
            <label class="text-sm font-semibold text-neutral-600">Пароль</label>
            <CustomInput
              v-model="password"
              :is-password="true"
              placeholder="Минимум 8 символов"
              container-class="mt-2"
              minlength="8"
              :disabled="loading"
            />
          </div>

          <button
            type="submit"
            class="mt-2 w-full rounded-lg bg-[#1a1a1a] px-6 py-3.5 text-sm font-semibold text-[#e8faf3] transition hover:bg-brand-mint hover:text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Регистрация…' : 'Зарегистрироваться' }}
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-[#1a1a1a]/75">
          Уже есть аккаунт?
          <NuxtLink to="/login" class="font-semibold text-brand-mint-dark transition hover:text-brand-mint">
            Войти
          </NuxtLink>
        </p>

      </section>
      <p class="mt-4 text-center text-xs text-[#1a1a1a]/45">
        Нажимая кнопку, вы соглашаетесь с правилами платформы Photo Shoot
      </p>
    </div>
  </div>
</template>
