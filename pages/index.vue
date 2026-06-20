<script setup lang="ts">
import { ArrowRight, Camera, Check, Heart, User } from '@lucide/vue'
import CategoryShowcaseCard from '~/components/Cards/CategoryShowcaseCard.vue'
import QuickSearchOrderForm from '~/components/QuickSearchOrderForm.vue'

useHead({ title: 'Главная' })

const activeCategory = ref('Все')

const { categoryStats, categories } = useCategories()

const MARQUEE_BASE_WIDTH = 1200
const MARQUEE_BASE_DURATION = 20
const MARQUEE_MIN_DURATION = 10

const marqueeDuration = ref(MARQUEE_BASE_DURATION)
const promoSectionRef = ref<HTMLElement | null>(null)
const marqueeWrapRef = ref<HTMLElement | null>(null)
const promoEffectsActive = ref(true)
const marqueeActive = ref(true)

function updateMarqueeDuration() {
  const width = window.innerWidth
  marqueeDuration.value =
    width >= MARQUEE_BASE_WIDTH
      ? MARQUEE_BASE_DURATION
      : Math.max(MARQUEE_MIN_DURATION, MARQUEE_BASE_DURATION * (width / MARQUEE_BASE_WIDTH))
}

let scrollEffectsObserver: IntersectionObserver | null = null

onMounted(() => {
  updateMarqueeDuration()
  window.addEventListener('resize', updateMarqueeDuration, { passive: true })

  if (!import.meta.client) return

  scrollEffectsObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === promoSectionRef.value) {
          promoEffectsActive.value = entry.isIntersecting
        }
        if (entry.target === marqueeWrapRef.value) {
          marqueeActive.value = entry.isIntersecting
        }
      }
    },
    { rootMargin: '80px' },
  )

  if (promoSectionRef.value) scrollEffectsObserver.observe(promoSectionRef.value)
  if (marqueeWrapRef.value) scrollEffectsObserver.observe(marqueeWrapRef.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMarqueeDuration)
  scrollEffectsObserver?.disconnect()
})

const mainRoles = [
  {
    title: 'Фотограф',
    subtitle: 'Для всех городов РФ',
    text: 'Ведите портфолио, публикуйте работы по категориям и находите клиентов через каталог.',
    features: ['Портфолио и категории съёмок', 'Профиль с городом и описанием', 'Публикация примеров работ'],
    to: '/cabinet/photographer',
    cta: 'Открыть кабинет',
    icon: Camera,
    accent: false,
  },
  {
    title: 'Клиент',
    subtitle: 'Для всех городов РФ',
    text: 'Ищите авторов по стилю, смотрите портфолио и сохраняйте понравившихся в избранное.',
    features: ['Каталог с фильтрами по жанрам', 'Избранные фотографы в кабинете', 'Просмотр работ без регистрации на сайте'],
    to: '/cabinet/client',
    cta: 'Открыть кабинет',
    icon: User,
    accent: true,
    badge: 'Основная роль',
  },
]

const steps = [
  { num: '01', title: 'Выберите категорию', text: 'Портрет, свадьба, пейзаж и другие направления.' },
  { num: '02', title: 'Смотрите портфолио', text: 'Примеры работ разных фотографов в каталоге.' },
  { num: '03', title: 'Сохраняйте авторов', text: 'Подписывайтесь на авторов и получайте уведомления о новых работах.' },
]

const clientHighlights = [
  {
    title: 'Быстрый подбор',
    text: 'Выбирайте жанр и сразу смотрите подходящие портфолио.',
    tag: '30 секунд на старт',
  },
  {
    title: 'Сравнение в одном месте',
    text: 'Сохраняйте понравившихся авторов и сравнивайте стиль, подачу и подачу света.',
    tag: 'Избранное под рукой',
  },
  {
    title: 'Фокус на результате',
    text: 'Оценивайте реальные серии работ, а не только пару удачных снимков.',
    tag: 'Только живые примеры',
  },
]

const clientScenarios = [
  'Нужен фотограф на свадьбу в ближайшие выходные',
  'Ищете семейную съёмку в мягком естественном стиле',
  'Подбираете автора для личного бренда или контента',
]
</script>

<template>
  <div class="home-page min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden">
    <section class="hero-section relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-32 max-md:pt-3 border-b border-neutral-200/60 max-md:min-h-mobile-hero md:h-screen md:min-h-[800px]">
      <div class="hero-glow pointer-events-none absolute inset-0 z-0 max-lg:hidden" />

      <div class="hero-content-fade pointer-events-none absolute inset-y-0 left-0 z-[2] hidden lg:block" />
      <div class="site-container mx-auto px-4 sm:px-6 relative z-10">
        <div class="top-container relative flex flex-col max-md:border max-md:overflow-hidden max-md:border-brand-mint max-md:min-h-mobile-hero max-md:p-4 max-md:pb-[calc(env(safe-area-inset-bottom)+1rem)] max-md:rounded-2xl lg:min-h-[520px]">
          <div class="bg-gradient-to-b from-brand-mint-light via-brand-mint-dark/40 to-neutral-100 pointer-events-none absolute inset-0 z-0 hidden max-md:block" />
            <div class="mb-8 flex flex-wrap gap-2.5 animate-fade-in z-1">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-neutral-200 text-neutral-600 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-mint animate-pulse" />
                Портфолио фотографов
              </span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-neutral-200 text-neutral-600 shadow-sm">
                Фильтры по категориям
              </span>
          </div>
          
          <h1 class="hero-title max-w-5xl z-2 text-[32px] sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] uppercase">
            Найди фотографа
            <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-mint-dark to-neutral-800 italic font-serif normal-case tracking-normal">по портфолио <br>и стилю</span> 
            
          </h1>
          
          <p class="mt-8 z-1 max-w-2xl text-lg md:text-xl text-neutral-500 font-light leading-relaxed max-md:text-black max-md:mb-0 lg:mb-auto">
            Платформа с примерами работ по категориям. Фотографы показывают портфолио, клиенты сохраняют понравившихся авторов.
          </p>
          <ClientOnly>
            <div class="hero-globe-wrap pointer-events-none z-1">
              <HeroGlobe />
            </div>
          </ClientOnly>
          <div class="mt-12 z-1 flex flex-col sm:flex-row gap-4 max-md:gap-2 sm:items-center max-md:mt-8">
            <NuxtLink to="/catalog" class="group relative inline-flex items-center justify-center bg-brand-text text-white font-semibold px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:bg-brand-mint-dark hover:shadow-[0_10px_30px_rgba(26,184,116,0.2)]">
              Смотреть каталог
            </NuxtLink>
            <NuxtLink to="/register" class="inline-flex items-center justify-center bg-white text-brand-text border border-neutral-200 hover:border-neutral-400 font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-neutral-50">
              Присоединиться
            </NuxtLink>
          </div>


        </div>

      </div>
    </section>

    <div
      ref="marqueeWrapRef"
      class="marquee-wrap overflow-hidden border-b border-neutral-200 bg-white py-6 relative"
      :class="{ 'marquee-paused': !marqueeActive }"
    >
      <div
        class="flex whitespace-nowrap animate-marquee"
        :style="{ animationDuration: `${marqueeDuration}s` }"
      >
        <span v-for="n in 4" :key="n" class="flex shrink-0 items-center gap-16 px-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
          <span>PHOTO SHOOT — портфолио фотографов</span>
          <span class="w-1.5 h-1.5 rounded-full bg-brand-mint" />
          <span>Категории: портрет, свадьба, пейзаж</span>
          <span class="w-1.5 h-1.5 rounded-full bg-brand-mint" />
          <span>Избранные фотографы у клиента</span>
        </span>
      </div>
    </div>


    <section
      ref="promoSectionRef"
      class="py-24 md:py-32 bg-gradient-to-br from-[#134e35] via-[#161a1d] to-[#12261e] relative overflow-hidden border-b border-neutral-200/60"
      :class="{ 'promo-effects-paused': !promoEffectsActive }"
    >
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-0 max-md:hidden">
        <div class="particle particle--1 absolute w-3 h-3 bg-[#20d489]/30 rounded-full top-10 left-[15%]" />
        <div class="particle particle--2 absolute w-3 h-3 bg-[#20d489]/60 rounded-full top-40 right-[10%]" />
        <div class="particle particle--3 absolute w-2 h-2 bg-[#20d489]/50 rounded-full bottom-12 left-[45%]" />
        <div class="particle particle--4 absolute w-4 h-4 bg-[#20d489]/40 rounded-full top-1/2 left-[5%]" />
      </div>

      <div class="absolute -right-18 -bottom-18 w-96 h-96 bg-gradient-to-tr from-[#20d489] to-[#1ab874] rounded-full blur-[140px] opacity-20 pointer-events-none max-md:hidden" />
      <div class="absolute -left-20 -top-20 w-80 h-80 bg-[#20d489] rounded-full blur-[120px] opacity-10 pointer-events-none max-md:hidden" />

      <div class="site-container mx-auto px-4 sm:px-6 relative z-10">
        <div class="grid gap-12 lg:grid-cols-12 items-center">
          
          <div class="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#e8faf3] text-[#1a1a1a] border border-[#20d489]/30 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-[#20d489] animate-pulse" />
                Акция: Быстрый старт в май-июнь
              </div>
              
              <h3 class="mt-8 text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.95]">
                Хватит искать. <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#20d489] to-[#5ceca8] italic font-serif normal-case tracking-normal">Начни снимать.</span>
              </h3>
              
              <p class="mt-6 text-neutral-300 font-light max-w-xl text-base md:text-lg leading-relaxed">
                Регистрируйся сегодня как фотограф и получи <span class="text-[#20d489] font-semibold">закрепление профиля в топе</span> вашего города на 14 дней бесплатно. Клиенты увидят вас первыми.
              </p>
            </div>

            <div class="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-8 max-sm:hidden">
              <div class="group/item">
                <p class="text-3xl md:text-5xl font-black text-white tracking-tight group-hover/item:text-[#20d489] transition-colors">138</p>
                <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Авторов РФ</p>
              </div>
              <div class="group/item">
                <p class="text-3xl md:text-5xl font-black text-[#20d489] tracking-tight">2.4к+</p>
                <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Работ в базе</p>
              </div>
              <div class="group/item">
                <p class="text-3xl md:text-5xl font-black text-white tracking-tight group-hover/item:text-[#20d489] transition-colors">20+</p>
                <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Категорий</p>
              </div>
              <div class="group/item">
                <p class="text-3xl md:text-5xl font-black text-white tracking-tight group-hover/item:text-[#20d489] transition-colors">45</p>
                <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Городов</p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5">
            <QuickSearchOrderForm />
          </div>

        </div>
      </div>
    </section>

    <section id="about" class="py-24 md:py-32 border-b border-neutral-200/60 bg-white relative">
      <div class="site-container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-widest text-brand-mint-dark mb-3">Процесс</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase">Как это работает</h2>
        </div>
        
        <div class="mt-16 grid gap-3 md:grid-cols-3">
          <div v-for="step in steps" :key="step.num" class="group relative p-8 rounded-3xl border border-neutral-200 shadow-sm bg-white transition-colors duration-300 hover:bg-brand-mint-dark hover:border-brand-mint/40 hover:shadow-sm">
            <p class="text-5xl font-black font-serif italic text-transparent bg-clip-text bg-gradient-to-t from-brand-mint-dark/40 to-neutral-500 transition-all duration-300 group-hover:from-white/60 group-hover:to-white">{{ step.num }}</p>
            <h3 class="mt-6 text-xl font-bold tracking-tight group-hover:text-white">{{ step.title }}</h3>
            <p class="mt-3 text-neutral-500 font-light text-sm leading-relaxed group-hover:text-gray-200">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="genres" class="home-deferred-section py-24 md:py-32 border-b border-neutral-200/60">
      <div class="site-container mx-auto px-4 sm:px-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-brand-mint-dark mb-3">Направления</p>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase">Категории портфолио</h2>
            <p class="mt-3 text-neutral-500 font-light">Фильтруйте работы по направлении съёмки</p>
          </div>
          
          <div class="flex flex-wrap gap-2 max-w-2xl md:justify-end">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              class="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border"
              :class="activeCategory === category
                ? 'bg-brand-text text-white border-brand-text shadow-sm scale-105'
                : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-brand-text shadow-sm'"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="mt-16 grid gap-6 ">
          <CategoryShowcaseCard
            v-for="item in categoryStats"
            :key="item.name"
            :item="item"
            :is-dimmed="activeCategory !== 'Все' && activeCategory !== item.name"
          />
        </div>
      </div>
    </section>

    <section id="roles" class="home-deferred-section py-24 md:py-32 border-b border-neutral-200/60 bg-white">
      <div class="site-container mx-auto px-4 sm:px-6">
        <div class="text-center max-w-3xl mx-auto mb-20 max-md:!mb-8">
          <p class="text-xs font-bold uppercase tracking-widest text-brand-mint-dark mb-3">Экосистема</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase">Кабинеты и роли</h2>
          <p class="mt-4 text-neutral-500 font-light">Фотограф ведёт портфолио, клиент сохраняет авторов</p>
        </div>

        <div class="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8 max-md:mt-0">
          <article
            v-for="role in mainRoles"
            :key="role.title"
            class="group relative flex min-h-[28rem] flex-col rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-[background-color,border-color,box-shadow] duration-300 md:min-h-[32rem] md:p-8"
            :class="
              role.accent
                ? 'border border-brand-mint/25 bg-gradient-to-br from-[#e8faf3] via-[#d4f5e8] to-[#c8f0df] group-hover:border-brand-mint/50 group-hover:from-[#d8f8ec] group-hover:via-[#c0f0dc] group-hover:to-[#a8e8d0] group-hover:shadow-[0_16px_44px_rgba(32,212,137,0.18)] md:min-h-[34rem]'
                : 'border border-transparent bg-[#1a1a1a] group-hover:border-brand-mint/20 group-hover:bg-[#242424] group-hover:shadow-[0_16px_44px_rgba(0,0,0,0.2)]'
            "
          >
            <span
              v-if="role.badge"
              class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1a1a1a] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#e8faf3] transition-colors duration-300 group-hover:bg-brand-mint group-hover:text-[#1a1a1a]"
            >
              {{ role.badge }}
            </span>
            <component
              :is="role.icon"
              class="mb-1 h-8 w-8 transition-colors duration-300"
              :class="
                role.accent
                  ? 'text-[#1ab874] group-hover:text-brand-mint'
                  : 'text-brand-mint group-hover:text-[#5ceca8]'
              "
              aria-hidden="true"
            />
            <h3
              class="mt-3 text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-tight tracking-tight transition-colors duration-300"
              :class="
                role.accent
                  ? 'text-[#1a1a1a] group-hover:text-brand-mint-dark'
                  : 'text-brand-mint group-hover:!text-white'
              "
            >
              {{ role.title }}
            </h3>
            <p
              class="mt-2 text-xs font-semibold tracking-wide transition-colors duration-300"
              :class="
                role.accent
                  ? 'text-[#1ab874] group-hover:text-brand-mint'
                  : 'text-brand-mint group-hover:text-[#5ceca8]'
              "
            >
              {{ role.subtitle }}
            </p>
            <p
              class="mt-4 max-w-[22rem] flex-1 text-sm leading-relaxed transition-colors duration-300"
              :class="
                role.accent
                  ? 'text-[#1a1a1a]/70 group-hover:text-[#1a1a1a]/90'
                  : 'text-white/65 group-hover:text-white/90'
              "
            >
              {{ role.text }}
            </p>
            <ul class="mt-6 flex flex-col gap-3">
              <li
                v-for="feature in role.features"
                :key="feature"
                class="flex items-start gap-2.5 text-[0.8125rem] leading-snug transition-colors duration-300"
                :class="
                  role.accent
                    ? 'text-[#333] group-hover:text-[#1a1a1a]'
                    : 'text-white/85 group-hover:text-white'
                "
              >
                <span
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                  :class="
                    role.accent
                      ? 'bg-[#1a1a1a]/8 text-[#1a1a1a] group-hover:bg-brand-mint/25 group-hover:text-brand-mint-dark'
                      : 'bg-brand-mint/20 text-brand-mint group-hover:bg-brand-mint/35 group-hover:text-[#5ceca8]'
                  "
                  aria-hidden="true"
                >
                  <Check class="h-3.5 w-3.5" stroke-width="3" />
                </span>
                {{ feature }}
              </li>
            </ul>
            <NuxtLink
              :to="role.to"
              class="mt-7 block w-full rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-colors duration-300"
              :class="
                role.accent
                  ? 'bg-[#1a1a1a] text-[#e8faf3] group-hover:bg-brand-mint group-hover:text-[#1a1a1a]'
                  : 'bg-brand-mint text-[#1a1a1a] group-hover:bg-white group-hover:text-white'
              "
            >
              {{ role.cta }}
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="home-deferred-section py-24 md:py-36 relative overflow-hidden">
      <div class="site-container mx-auto px-4 sm:px-6 relative z-10">
        
        <div class="text-center max-w-3xl mx-auto mb-20 max-md:!mb-8">
          <span class="text-xs font-black uppercase tracking-widest text-[#1ab874] bg-[#e8faf3] border border-brand-mint-dark/50 px-4 py-1.5 rounded-full">Умный инструмент</span>
          <h2 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mt-6 leading-none">
            Интеллектуальный <br/>фокус на контенте
          </h2>
          <p class="mt-4 text-neutral-500 font-light text-base md:text-lg">
            Мы избавились от хаоса, бесконечных переписок и пустых ожиданий. Процесс подбора автоматизирован до идеала.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3 items-stretch">
          
          <div class="md:col-span-2 relative overflow-hidden rounded-[2.5rem] border border-neutral-200/80 bg-white p-8 md:p-12 shadow-sm flex flex-col justify-between group transition-[box-shadow,border-color] duration-500 hover:shadow-md hover:border-brand-mint/60">
            <div class="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#e8faf3] to-transparent rounded-full blur-3xl opacity-70 group-hover:scale-125 transition-transform duration-700 max-md:hidden" />
            
            <div>
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full bg-brand-mint-dark animate-ping" />
                <p class="text-xs font-bold uppercase tracking-widest text-brand-mint-dark">Живая Экосистема</p>
              </div>
              <h3 class="text-3xl md:text-4xl font-black tracking-tight uppercase mt-6 max-w-xl">
                Платформа, которая уважает время и эстетику
              </h3>
            </div>

            <div class="mt-12">
              <div class="grid gap-4 grid-cols-3 border-t border-neutral-100 pt-8 mb-8">
                <div>
                  <p class="text-2xl md:text-4xl font-black text-brand-text tracking-tight">138+</p>
                  <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">фотографов</p>
                </div>
                <div>
                  <p class="text-2xl md:text-4xl font-black text-brand-mint-dark tracking-tight">2 400+</p>
                  <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">работ</p>
                </div>
                <div>
                  <p class="text-2xl md:text-4xl font-black text-brand-text tracking-tight">20+</p>
                  <p class="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">категорий</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-4">
                <NuxtLink to="/catalog" class="inline-flex items-center justify-center bg-brand-text text-white font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all hover:bg-brand-mint-dark shadow-sm">
                  Открыть каталог
                </NuxtLink>
                <NuxtLink to="/register" class="inline-flex items-center justify-center bg-white text-brand-text border border-neutral-200 font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all hover:bg-neutral-50">
                  Создать аккаунт
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <article
              v-for="item in clientHighlights"
              :key="item.title"
              class="group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm bg-white p-6 flex-1 flex flex-col justify-between transition-all duration-300 hover:border-brand-mint/60 hover:shadow-sm"
            >
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-brand-mint-dark bg-[#e8faf3] inline-block px-2.5 py-0.5 rounded-md">{{ item.tag }}</p>
                <h4 class="mt-4 text-lg font-black tracking-tight text-brand-text group-hover:text-brand-mint-dark transition-colors">{{ item.title }}</h4>
              </div>
              <p class="mt-2 text-sm text-neutral-500 font-light leading-relaxed">{{ item.text }}</p>
            </article>
          </div>
          
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
:deep(:root), .home-page {
  --brand-mint: #20d489;
  --brand-mint-dark: #1ab874;
}

.text-brand-mint { color: var(--brand-mint, #20d489); }
.text-brand-mint-dark { color: var(--brand-mint-dark, #1ab874); }
.bg-brand-mint { background-color: var(--brand-mint, #20d489); }
.border-brand-mint\/25 { border-color: rgba(32, 212, 137, 0.25); }
.border-brand-mint\/40 { border-color: rgba(32, 212, 137, 0.4); }
.border-brand-mint\/50 { border-color: rgba(32, 212, 137, 0.5); }
.border-brand-mint\/60 { border-color: rgba(32, 212, 137, 0.6); }

.hero-glow {
  background: 
    radial-gradient(circle at 50% -20%, rgba(32, 212, 137, 0.12) 0%, transparent 60%),
    radial-gradient(circle at 90% 40%, rgba(32, 212, 137, 0.04) 0%, transparent 40%),
    linear-gradient(rgba(32, 212, 137, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(32, 212, 137, 0.04) 1px, transparent 1px);
  background-size: auto, auto, 48px 48px, 48px 48px;
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
}

.hero-globe-wrap {
  position: relative;
  opacity: 0.72;
}

@media (max-width: 1023px) {
  .hero-globe-wrap {
    align-self: flex-end;
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translateY(60%) translateX(30%);
    width: min(580px, 88vw);
    margin-top: 0.25rem;
    margin-right: -1.25rem;
    margin-bottom: -0.5rem;
    opacity: 0.78;
  }
}

@media (max-width: 767px) {
  .hero-globe-wrap {
    width: min(640px, 82vw);
    margin-top: auto;
    margin-right: -0.5rem;
    margin-bottom: 0;
    opacity: 0.58;
    transform: translateY(30%) translateX(30%);
    position: absolute;
    bottom: 0;
    right: 0;
  }
}

@media (min-width: 1024px) {
  .hero-globe-wrap {
    position: absolute;
    top: 78%;
    right: -14%;
    z-index: 1;
    width: min(680px, 58vw);
    margin-top: 0;
    transform: translateY(-52%);
    opacity: 0.92;
  }
}

.hero-content-fade {
  width: min(52%, 620px);
  background: linear-gradient(
    to right,
    #f2f2f2 0%,
    rgba(242, 242, 242, 0.94) 50%,
    rgba(242, 242, 242, 0.45) 72%,
    transparent 100%
  );
}

.hero-glow-mobile {
  background: 
    radial-gradient(circle at 50% -20%, rgba(32, 212, 137, 0.12) 0%, transparent 60%),
    radial-gradient(circle at 90% 40%, rgba(32, 212, 137, 0.479) 0%, transparent 40%);
}


.animate-marquee {
  animation: marquee linear infinite;
}

.marquee-paused .animate-marquee {
  animation-play-state: paused;
}

.promo-effects-paused .particle {
  animation-play-state: paused;
}

@media (max-width: 767px) {
  .home-deferred-section {
    content-visibility: auto;
    contain-intrinsic-size: auto 720px;
  }
}

@supports (-webkit-touch-callout: none) {
  @media (max-width: 767px) {
    .home-deferred-section {
      content-visibility: visible;
      contain-intrinsic-size: auto;
    }
  }
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.particle {
  will-change: transform, opacity;
}

.particle--1 {
  animation: particle-flight-1 14s ease-in-out infinite;
}

.particle--2 {
  animation: particle-flight-2 11s ease-in-out infinite;
  animation-delay: -3s;
}

.particle--3 {
  animation: particle-flight-3 16s ease-in-out infinite;
  animation-delay: -6s;
}

.particle--4 {
  animation: particle-flight-4 12s ease-in-out infinite;
  animation-delay: -2s;
}

@keyframes particle-flight-1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  25% { transform: translate(28px, -36px) scale(1.08); opacity: 0.55; }
  50% { transform: translate(12px, -64px) scale(0.95); opacity: 0.35; }
  75% { transform: translate(-18px, -28px) scale(1.05); opacity: 0.5; }
}

@keyframes particle-flight-2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
  33% { transform: translate(-42px, -24px) scale(1.12); opacity: 0.35; }
  66% { transform: translate(-20px, 32px) scale(0.9); opacity: 0.2; }
}

@keyframes particle-flight-3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
  20% { transform: translate(-24px, -48px) scale(1.1); opacity: 0.45; }
  55% { transform: translate(36px, -20px) scale(0.92); opacity: 0.25; }
  80% { transform: translate(16px, 28px) scale(1.06); opacity: 0.4; }
}

@keyframes particle-flight-4 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  40% { transform: translate(48px, -40px) scale(1.15); opacity: 0.65; }
  70% { transform: translate(24px, 20px) scale(0.88); opacity: 0.3; }
}
</style>