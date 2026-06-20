<template>
  <footer class="site-footer mt-auto border-t border-neutral-200/80 bg-white/90 backdrop-blur-sm">
    <div class="site-container py-10 pb-24 md:py-12 md:pb-12">
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div class="max-w-xs shrink-0">
          <p class="text-lg font-extrabold">
            <span class="text-brand-mint">PHOTO</span> SHOOT
          </p>
          <p class="mt-2 max-w-xs text-sm text-neutral-500">
            Портфолио фотографов по категориям — находи авторов и сохраняй в избранное
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-neutral-400">Контакты</p>
          <p class="mt-3 text-sm footer-muted">+7 (900) 123-45-67</p>
          <p class="text-sm footer-muted">info@photoshoot.ru</p>
        </div>

        <div class="shrink-0 md:text-right">
          <p class="text-sm font-semibold uppercase tracking-wide text-neutral-400">Разделы</p>
          <div class="mt-3 flex flex-col gap-2 text-sm md:items-end">
            <NuxtLink to="/catalog" class="footer-link">Каталог</NuxtLink>
            <NuxtLink to="/register" class="footer-link">Регистрация</NuxtLink>
            <NuxtLink to="/cabinet/client" class="footer-link">Кабинет клиента</NuxtLink>
            <NuxtLink to="/cabinet/photographer" class="footer-link">Кабинет фотографа</NuxtLink>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-center justify-between gap-2 border-t border-neutral-100 pt-6 text-xs text-neutral-400 sm:flex-row">
        <p>© 2026 Все права защищены</p>
        <p>Портфолио · избранные фотографы · 2 роли</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@reference "../assets/globals.css";

.footer-muted {
  @apply text-neutral-500;
}

.footer-link {
  @apply text-neutral-500 transition hover:text-brand-mint;
}
</style>
