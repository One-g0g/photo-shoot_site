<script setup lang="ts">
import { getApiErrorMessage } from '~/api/client'
import CustomInput from '~/components/Inputs/CustomInput.vue'

definePageMeta({
  layout: 'auth',
})

useHead({ title: 'Вход' })

const { $toast } = useNuxtApp()

const email = ref('')
const password = ref('')
const loading = ref(false)

const route = useRoute()

const { loginAccount, isLoggedIn, cabinetPath } = useUser()

const redirectTo = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : null
})

async function onSubmit() {
  if (!email.value.trim() || password.value.length < 8) return

  loading.value = true

  try {
    await loginAccount({
      email: email.value.trim(),
      password: password.value,
    })
    await navigateTo(redirectTo.value ?? cabinetPath.value)
  } catch (error) {
    $toast.error(getApiErrorMessage(error), 'Проверьте email и пароль или попробуйте позже')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo(redirectTo.value ?? cabinetPath.value)
  }
})
</script>

<template>
  <div class="flex flex-1 items-center py-10 auth-page max-md:!py-0">
    <div class="site-container mx-auto w-full !max-w-lg max-md:!px-[8px]">
      <section
        class="relative mt-8 rounded-[2rem] max-md:rounded-3xl max-md:max-w-[440px] mx-auto border border-neutral-200/90 bg-white p-4 md:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
      >
        <span
          class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1a1a1a] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#e8faf3]"
        >
          Авторизация
        </span>

        <h1 class="mt-3 text-[clamp(1.7rem,4vw,2rem)] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
          Войти в аккаунт
        </h1>
        <p class="mt-1 text-sm text-neutral-500">
          Войдите, чтобы продолжить работу с каталогом и кабинетами.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
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
            {{ loading ? 'Вход…' : 'Войти' }}
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-[#1a1a1a]/75">
          Нет аккаунта?
          <NuxtLink to="/register" class="font-semibold text-brand-mint-dark transition hover:text-brand-mint">
            Зарегистрироваться
          </NuxtLink>
        </p>
      </section>
    </div>
  </div>
</template>
