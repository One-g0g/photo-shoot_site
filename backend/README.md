# Photo Shoot — Backend

NestJS API с PostgreSQL: регистрация, вход, профиль по JWT.

Формат пользователя совпадает с фронтендом — [`frontend/composables/useUser.ts`](../frontend/composables/useUser.ts).

---

## Гайд по этапам

### Этап 0. Что нужно установить

| Инструмент | Зачем |
| ---------- | ----- |
| **Node.js 20+** | Запуск API локально |
| **Docker Desktop** | PostgreSQL локально и деплой на сервере |
| **npm** | Зависимости и скрипты проекта |

Проверка:

```bash
node -v
docker -v
```

---

### Этап 1. Запустить Docker Desktop

Перед поднятием PostgreSQL убедитесь, что Docker Desktop **запущен** (иконка в трее активна).

Если при `docker compose` видите ошибку вроде `dockerDesktopLinuxEngine: The system cannot find the file specified` — Docker не запущен. Откройте Docker Desktop и повторите команду.

---

### Этап 2. Поднять PostgreSQL

Из корня репозитория:

```bash
cd backend
docker compose up -d postgres
```

Проверка, что контейнер работает:

```bash
docker compose ps
```

Должен быть сервис `postgres` в статусе `running`. Порт на хосте: **5432**.

---

### Этап 3. Настроить переменные окружения

При первом запуске:

```bash
cp .env.example .env
```

Откройте `.env` и **обязательно** смените `JWT_SECRET` на длинную случайную строку (для production — уникальный секрет).

Минимальный набор для локальной разработки (уже есть в `.env.example`):

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=photoshoot
DATABASE_PASSWORD=photoshoot
DATABASE_NAME=photoshoot

JWT_SECRET=ffff3344-wwww-wwqewqe-eee-ewqeq-ewqe-ewqewqew
JWT_EXPIRES_IN=180d
```

---

### Этап 4. Установить зависимости и запустить API

```bash
npm install
npm run start:dev
```

API доступен по адресу: **http://localhost:3001/api**

В режиме `development` TypeORM сам создаёт таблицы в БД (`synchronize: true`). В production синхронизация отключена.

---

### Этап 5. Проверить, что API отвечает

**Сначала в браузере:** откройте http://localhost:3001/api/health — должен показаться `{"status":"ok"}`.

**Через curl в cmd/PowerShell** — если в системе задан прокси (`http_proxy` / `HTTP_PROXY`), curl по умолчанию шлёт **даже localhost** через него и вы получите `curl: (52) Empty reply from server`. Обход:

```bash
curl --noproxy "*" http://127.0.0.1:3001/api/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

---

### Этап 6. Протестировать регистрацию и вход

**Регистрация** (флаг `--noproxy "*"` — см. этап 5, если curl не отвечает):

```bash
curl --noproxy "*" -X POST http://127.0.0.1:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Анна\",\"email\":\"anna@test.local\",\"password\":\"password123\"}"
```

> В PowerShell для JSON удобнее `curl.exe` и одинарные кавычки вокруг тела запроса.

**Вход:**

```bash
curl --noproxy "*" -X POST http://127.0.0.1:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"anna@test.local\",\"password\":\"password123\"}"
```

**Ответ** (и для register, и для login):

```json
{
  "user": {
    "id": "uuid",
    "name": "Анна",
    "email": "anna@test.local",
    "role": "client"
  },
  "accessToken": "eyJ..."
}
```

**Текущий пользователь** (подставьте токен из ответа):

```bash
curl --noproxy "*" http://127.0.0.1:3001/api/auth/me ^
  -H "Authorization: Bearer ВАШ_ACCESS_TOKEN"
```

---

### Этап 7. Полный запуск в Docker (для сервера)

Когда нужно поднять **и БД, и API** одной командой (локально или на VPS):

```bash
cd backend
docker compose up -d --build
```

- PostgreSQL — внутри сети Docker (`DATABASE_HOST=postgres` в `docker-compose.yml`)
- API — **http://localhost:3001/api**

Перед деплоем на сервер:

1. Задайте надёжный `JWT_SECRET` (через `.env` или переменные окружения хоста).
2. Настройте `CORS_ORIGIN` на домен фронтенда.
3. Для production рассмотрите миграции TypeORM вместо `synchronize` (сейчас в prod `synchronize` выключен, схему нужно будет создавать миграциями).

Остановка:

```bash
docker compose down
```

Данные PostgreSQL сохраняются в volume `postgres_data`.

---

### Этап 8. Подключить frontend (следующий шаг)

Фронтенд пока использует mock в `useUser`. Чтобы связать с API:

1. Создайте `frontend/.env`:

```env
NUXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. В `useUser` вызывайте:
   - `POST /auth/register` — страница регистрации
   - `POST /auth/login` — страница входа
   - `GET /auth/me` — восстановление сессии по токену

3. Сохраняйте `accessToken` (localStorage или cookie) и передавайте в заголовке `Authorization: Bearer …`.

Поля пользователя на бэкенде совпадают с типом `User` во фронтенде:

```ts
{
  id: string
  name: string
  email: string
  role: 'client' | 'photographer'
  avatar?: string
}
```

---

## Справка по API

Префикс всех маршрутов: **`/api`**.

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| `GET` | `/api/health` | Проверка работы сервера |
| `POST` | `/api/auth/register` | Регистрация |
| `POST` | `/api/auth/login` | Вход |
| `GET` | `/api/auth/me` | Текущий пользователь (нужен JWT) |

### `POST /api/auth/register`

```json
{
  "name": "Анна",
  "email": "anna@example.com",
  "password": "password123",
  "role": "client"
}
```

- `password` — минимум **8** символов (как на страницах login/register во фронтенде).
- `role` — необязателен: `client` (по умолчанию) или `photographer`.

### `POST /api/auth/login`

```json
{
  "email": "anna@example.com",
  "password": "password123"
}
```

### `GET /api/auth/me`

Заголовок: `Authorization: Bearer <accessToken>`

### `POST /api/users/me/avatar`

`multipart/form-data`, поле `file` (JPG/PNG/WebP, до 2 МБ).  
Заголовок: `Authorization: Bearer <accessToken>`

Ответ: `{ "user": { ... } }` с полем `avatar` вида `/uploads/avatars/{id}/avatar.webp?t=...`

Файлы отдаются по `http://localhost:3001/uploads/...`

### `DELETE /api/users/me/avatar`

Сброс аватара. Заголовок: `Authorization: Bearer <accessToken>`

---

## npm-скрипты

| Команда | Описание |
| ------- | -------- |
| `npm run start:dev` | API с hot-reload (локальная разработка) |
| `npm run build` | Сборка в `dist/` |
| `npm run start:prod` | Запуск собранного приложения |
| `npm run test` | Unit-тесты |
| `npm run test:e2e` | E2E (нужна запущенная БД) |

---

## Структура проекта

```
backend/
├── src/
│   ├── auth/          # register, login, me, JWT
│   ├── users/         # сущность User, сервис
│   └── health/        # GET /api/health
├── docker-compose.yml # postgres + api
├── Dockerfile
├── .env.example
└── README.md          # этот файл
```

---

## Частые проблемы

| Симптом | Решение |
| ------- | ------- |
| `curl: (52) Empty reply from server` на localhost | В системе включён HTTP-прокси. Используйте `curl --noproxy "*"` или откройте URL в браузере |
| Docker: `pipe/dockerDesktopLinuxEngine` не найден | Запустите Docker Desktop |
| API не подключается к БД | Проверьте `docker compose ps`, что `postgres` running |
| `409` при регистрации | Email уже занят |
| `401` при входе | Неверный email или пароль |
| CORS с фронтенда (192.168.x.x, телефон в Wi‑Fi) | В `development` CORS открыт для любого origin. Перезапустите API после смены `NODE_ENV` |
| CORS на production | `CORS_ORIGIN=https://site.com,https://www.site.com` (через запятую) |

---

## Связанные файлы

- Frontend: [../frontend/README.md](../frontend/README.md)
- Хранение фото (аватары, портфолио): [../docs/media-storage.md](../docs/media-storage.md)
- Корень репозитория: [../README.md](../README.md)
