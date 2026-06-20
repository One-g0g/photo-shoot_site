export type PortfolioWork = {
  id: string
  title: string
  image: string
  photographer: string
  photographerId: string
  photographerAvatar: string
  category: string
  year: number
  location: string
  publishedAt: string
  description: string
  tags: string[]
  likes: number
  views: number
}

export const portfolioWorks: PortfolioWork[] = [
  {
    id: '1',
    title: 'Темп города',
    image: '/examples/5.png',
    photographer: 'Анна Петрова',
    photographerId: 'ph-anna',
    photographerAvatar: '/examples/1.png',
    category: 'Стрит',
    year: 2025,
    location: 'Москва',
    publishedAt: '12 марта 2025',
    description:
      'Ранний стрит-кадр в мягком боковом свете: город только просыпается, а кадр строится на контрасте теней и отражений в витринах. Съёмка без постановки, один дубль.',
    tags: ['стрит', 'утро', 'город'],
    likes: 128,
    views: 1840,
  },
  {
    id: '2',
    title: 'Свадебный свет',
    image: '/examples/3.png',
    photographer: 'Илья Козлов',
    photographerId: 'ph-ilya',
    photographerAvatar: '/examples/2.png',
    category: 'Свадьба',
    year: 2024,
    location: 'Санкт-Петербург',
    publishedAt: '3 ноября 2024',
    description:
      'Серия с церемонии и прогулки: акцент на естественных эмоциях и тёплом золотом часе. Без жёсткой постановки — только живые моменты.',
    tags: ['свадьба', 'пара', 'золотой час'],
    likes: 256,
    views: 3200,
  },
  {
    id: '3',
    title: 'Портрет в тени',
    image: '/examples/1.png',
    photographer: 'Мария Соколова',
    photographerId: 'ph-maria',
    photographerAvatar: '/examples/3.png',
    category: 'Портрет',
    year: 2025,
    location: 'Казань',
    publishedAt: '28 января 2025',
    description:
      'Портрет в низком ключе с одним источником света. Задача — передать характер и текстуру кожи без ретуши «пластика».',
    tags: ['портрет', 'тени', 'студия'],
    likes: 94,
    views: 1120,
  },
  {
    id: '4',
    title: 'Сосновый лес в тумане',
    image: '/examples/6.png',
    photographer: 'Егор Миронов',
    photographerId: 'ph-egor',
    photographerAvatar: '/examples/4.png',
    category: 'Природа',
    year: 2024,
    location: 'Карелия',
    publishedAt: '15 октября 2024',
    description:
      'Пейзаж в тумане: минималистичная композиция, приглушённая палитра и акцент на глубине леса. Съёмка на рассвете.',
    tags: ['природа', 'туман', 'лес'],
    likes: 71,
    views: 890,
  },
  {
    id: '5',
    title: 'Подсолнухи на закате',
    image: '/examples/4.png',
    photographer: 'Денис Алексеев',
    photographerId: 'ph-denis',
    photographerAvatar: '/examples/5.png',
    category: 'Пейзаж',
    year: 2025,
    location: 'Алтай',
    publishedAt: '5 февраля 2025',
    description:
      'Панорамный закат в горах: широкий план, насыщенное небо и силуэты вершин. Кадр для обложки travel-серии.',
    tags: ['пейзаж', 'горы', 'закат'],
    likes: 183,
    views: 2410,
  },
  {
    id: '6',
    title: 'Лица на стенах',
    image: '/examples/2.png',
    photographer: 'Ольга Лебедева',
    photographerId: 'ph-olga',
    photographerAvatar: '/examples/6.png',
    category: 'Арт',
    year: 2025,
    location: 'Новосибирск',
    publishedAt: '20 февраля 2025',
    description:
      'Домашняя семейная съёмка в тёплом свете ламп: дети, смех, естественные объятия. Документальный подход без постановки.',
    tags: ['арт', 'дом', 'граффити'],
    likes: 52,
    views: 640,
  },
]

export function getPortfolioWork(id: string) {
  return portfolioWorks.find((w) => w.id === id)
}

export function getWorksByPhotographer(photographerId: string) {
  return portfolioWorks.filter((w) => w.photographerId === photographerId)
}
