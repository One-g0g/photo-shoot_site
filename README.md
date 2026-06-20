# Photo Shoot

Платформа для просмотра портфолио фотографов по категориям. Фотографы публикуют примеры работ, клиенты ищут авторов и сохраняют понравившихся в избранное.

## Структура репозитория

```
photo-shoot/
├── frontend/   # Nuxt 4 + Vue 3 + Tailwind CSS
├── backend/    # NestJS API + PostgreSQL
└── docs/       # Архитектура и гайды (например media-storage.md)
```

## Быстрый старт

### Всё в Docker (одна команда)

Из корня репозитория:

```bash
docker compose -f compose.yaml up -d --build
```

Сайт: [http://localhost:3000](http://localhost:3000) — запросы `/api` и `/uploads` проксируются с фронта на контейнер `api`.

Для доступа по IP в локальной сети создайте `.env` в корне (см. `.env.example`):

```env
PUBLIC_SITE_URL=http://192.168.1.5:3000
```

Пересоберите фронт: `docker compose -f compose.yaml up -d --build front`.

На сервере укажите свой `PUBLIC_SITE_URL` (домен или IP) перед деплоем.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
docker compose up -d postgres
cp .env.example .env   # при первом запуске
npm install
npm run start:dev
```

API: [http://localhost:3001/api](http://localhost:3001/api) — подробнее в [backend/README.md](./backend/README.md).

## Основные возможности

- Каталог портфолио с фильтрами по категориям
- Личный кабинет фотографа (работы, категории, профиль)
- Личный кабинет клиента (избранные фотографы, профиль)
- Регистрация и переключение роли после входа

## Стек

| Часть     | Технологии                          |
| --------- | ----------------------------------- |
| Frontend  | Nuxt 4, Vue 3, Tailwind CSS 4, shadcn-vue |
| Backend   | NestJS, PostgreSQL, TypeORM, JWT    |

## Лицензия

Приватный проект.
