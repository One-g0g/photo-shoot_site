import { WORK_CATEGORIES } from '~/data/work-categories'

export type CategoryStat = {
  name: string
  count: string
  subtitle: string
  text: string
  image: string
}

const categoryStats: CategoryStat[] = [
  {
    name: 'Портрет',
    count: '120+ работ',
    subtitle: 'Выразительные лица и чистая работа со светом.',
    text: 'Подходит для личного бренда, актёрских анкет и контента в соцсети.',
    image: '/examples/1.png',
  },
  {
    name: 'Свадьба',
    count: '85+ работ',
    subtitle: 'Истории дня без постановочной перегрузки.',
    text: 'Смотрите полные серии: сборы, церемония, банкет и живые эмоции.',
    image: '/examples/3.png',
  },
  {
    name: 'Пейзаж',
    count: '95+ работ',
    subtitle: 'Атмосферные кадры с акцентом на цвет и глубину.',
    text: 'От городских панорам до природы: удобно подобрать настроение съёмки.',
    image: '/examples/4.png',
  },
  {
    name: 'Стрит',
    count: '70+ работ',
    subtitle: 'Динамика города и настоящие моменты.',
    text: 'Репортажный стиль для событий, прогулок и lifestyle-съёмок.',
    image: '/examples/5.png',
  },
  {
    name: 'Природа',
    count: '60+ работ',
    subtitle: 'Мягкий естественный свет и натуральные цвета.',
    text: 'Идеально для спокойных серий, семейных историй и love-story.',
    image: '/examples/6.png',
  },
  {
    name: 'Арт',
    count: '40+ работ',
    subtitle: 'Креативные концепции и необычные визуальные решения.',
    text: 'Если нужен нестандартный результат, начните отсюда.',
    image: '/examples/2.png',
  }
]

export function useCategories() {
  const categories = computed(() => [
    'Все',
    ...WORK_CATEGORIES.map((item) => item.value),
  ])

  return {
    categoryStats,
    categories,
  }
}
