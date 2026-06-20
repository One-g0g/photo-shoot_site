import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'

const siteUrl = 'http://photo-shoot.site' || 'http://localhost:3000'

/** Бэкенд для Nitro proxy в production (Docker: http://api:3001). */
const apiProxyTarget =
  process.env.NUXT_API_ORIGIN_INTERNAL?.replace(/\/$/, '') || 'http://127.0.0.1:3001'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-27',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '/api',
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN || 'http://localhost:3001',
      siteUrl,
    },
  },
  app: {
    head: {
      title: 'Photo Shoot',
      titleTemplate: '%s · Photo Shoot',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover, user-scalable=no',
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        {
          name: 'description',
          content: 'Photo Shoot — платформа портфолио фотографов: каталог работ, профили, лайки и личные кабинеты.',
        },
        {
          name: 'keywords',
          content: 'photo shoot, фотограф, портфолио, каталог фотографий, фотосессия, портрет, свадьба, love story, фотографы, работы фотографов',
        },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Photo Shoot — портфолио фотографов' },
        {
          property: 'og:description',
          content: 'Каталог работ, профили фотографов и удобные инструменты для публикации портфолио.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteUrl },
        { property: 'og:image', content: `${siteUrl}/og_image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'ru_RU' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/logo.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/logo.png', sizes: '180x180' },
        { rel: 'canonical', href: siteUrl },
      ],
    },
  },
  routeRules: {
    '/api/**': { proxy: `${apiProxyTarget}/api/**` },
    '/uploads/**': { proxy: `${apiProxyTarget}/uploads/**` },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  css: ['~/assets/globals.css'],
  vite: {
    plugins: [tailwindcss(), svgLoader({ defaultImport: 'url' })],
    optimizeDeps: {
      include: [
        '@lucide/vue',
        '@vueuse/core',
        'clsx',
        'reka-ui',
        'tailwind-merge',
      ]
    },
    vue: {
      features: {
        prodDevtools: false,
      },
    },
    server: {
      watch: {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
  },
})
