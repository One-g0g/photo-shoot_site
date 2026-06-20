<script setup lang="ts">
type CategoryShowcaseItem = {
  name: string
  count: string
  subtitle: string
  text: string
  image: string
}

const props = defineProps<{
  item: CategoryShowcaseItem
  isDimmed: boolean
}>()

const router = useRouter()

const catalogTo = computed(() => ({
  path: '/catalog',
  query: { category: props.item.name },
}))

function onCardClick() {
  window.open(router.resolve(catalogTo.value).href, '_blank')
}
</script>

<template>
  <div
    class="group relative min-h-[30rem] overflow-hidden rounded-[2rem] bg-neutral-900 transition-[opacity,box-shadow] duration-500 max-md:cursor-pointer md:min-h-[28rem]"
    :class="isDimmed ? 'opacity-35 saturate-50' : 'opacity-100 hover:shadow-[0_20px_48px_rgba(0,0,0,0.24)]'"
    @click="onCardClick"
  >
    <img
      :src="item.image"
      :alt="`Категория ${item.name}`"
      draggable="false"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 select-none max-md:transition-none max-md:scale-100 max-md:group-hover:scale-100"
    >
    <NuxtLink :to="catalogTo" class="absolute inset-0 top-0 bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10 md:from-black/80 md:via-black/45" />

    <div class="absolute left-4 top-4 z-10 flex items-center gap-2 md:left-6 md:top-6">
      <span class="rounded-full bg-black/45 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white max-md:bg-black/55 md:bg-white/20 md:backdrop-blur-sm">
        {{ item.count }}
      </span>
      <span class="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white/90 max-md:bg-black/55 md:bg-black/25 md:backdrop-blur-sm">
        Категория
      </span>
    </div>

    <div class="absolute inset-x-0 bottom-0 z-10 overflow-hidden p-4 md:p-6 w-fit">
      <div class="absolute inset-0 overflow-hidden rounded-b-4xl md:hidden">
        <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/80" />
      </div>
      <div class="relative z-1 md:max-w-[34ch]">
        <p class="mt-2 text-4xl font-black tracking-tight text-white md:text-4xl">
          {{ item.name }}
        </p>
        <p class="mt-3 text-sm leading-relaxed text-white/85 md:text-[0.95rem]">
          {{ item.text }}
        </p>
      </div>

      <NuxtLink
        :to="catalogTo"
        class="relative z-1 mt-5 hidden items-center justify-center rounded-full bg-white px-6 py-2.5 group-hover:bg-brand-mint group-hover:text-white text-sm font-semibold text-neutral-900 transition-all duration-300 hover:bg-brand-mint hover:text-white md:inline-flex"
        @click.stop
      >
        Смотреть в каталоге
      </NuxtLink>
    </div>
  </div>
</template>
