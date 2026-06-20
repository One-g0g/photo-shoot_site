# Хранение фото: аватары и портфолио

## Два типа файлов

| Тип | Кто | Назначение | Размер (ориентир) |
| --- | --- | --- | --- |
| **Аватар** | Клиент и фотограф | Профиль, шапка, карточки | до 2 МБ, квадрат ~256×256 |
| **Работа портфолио** | Только фотограф | Каталог, страница работы | до 15 МБ оригинал + превью ~1200px |

В БД храним **не файл**, а **ссылку (URL или ключ в object storage)**.

---

## Схема в PostgreSQL

```text
users
  avatar          varchar(512) nullable   -- URL или ключ: avatars/{userId}/avatar.webp

portfolio_works
  id              uuid
  photographer_id uuid → users
  title           varchar
  category        varchar
  image_url       varchar                 -- оригинал
  thumb_url       varchar nullable        -- превью для каталога
  status          draft | published
  created_at, updated_at
```

Поле `users.avatar` уже есть — под него делаем загрузку.

---

## Где лежат файлы

### Этап 1 — локальная разработка

```text
backend/uploads/
  avatars/{userId}/avatar.webp
  portfolio/{userId}/{workId}/original.jpg
  portfolio/{userId}/{workId}/thumb.webp
```

Nest отдаёт статику: `GET /uploads/...` или прокси через nginx.

### Этап 2 — сервер (Docker)

Тот же каталог в **volume**, чтобы пересборка контейнера не стирала файлы:

```yaml
volumes:
  - uploads_data:/app/uploads
```

### Этап 3 — production (рекомендуется)

**S3-совместимое хранилище** (MinIO в Docker, Yandex Object Storage, Selectel, AWS S3):

```text
s3://photo-shoot/
  avatars/{userId}/avatar.webp
  portfolio/{userId}/{workId}/original.jpg
  portfolio/{userId}/{workId}/thumb.webp
```

В `users.avatar` и `portfolio_works.image_url` — публичный URL или CDN-путь.

Плюсы: бэкапы, масштаб, отдельно от API-сервера.

---

## Обработка на бэкенде (NestJS)

Библиотека **sharp**:

- аватар: обрезка по центру, 256×256, WebP;
- портфолио: превью max 1200px по длинной стороне, WebP/JPEG.

Проверки: MIME (`image/jpeg`, `image/png`, `image/webp`), лимит размера, только свой `userId` (JWT).

---

## API (план)

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| `POST` | `/api/users/me/avatar` | `multipart/form-data`, поле `file` |
| `DELETE` | `/api/users/me/avatar` | Сброс на дефолт |
| `POST` | `/api/portfolio/works` | Файл + title, category |
| `PATCH` | `/api/portfolio/works/:id` | Метаданные |
| `DELETE` | `/api/portfolio/works/:id` | Удаление работы и файлов |

Ответ после загрузки аватара — обновлённый `user` (как в `/auth/me`).

---

## Фронтенд

- Дефолт: `/avatar/default_avatar.png` (уже в `useUser`).
- После загрузки: `user.avatar` = URL с API/CDN, `resolveUserAvatar()` подставляет в `<img>`.
- Кнопка **«Изменить аватар»** в меню → кабинет, вкладка профиля, блок `#avatar-edit`.

Портфолио: кнопка «Добавить работу» в кабинете фотографа → тот же flow с `multipart` на `/api/portfolio/works`.

---

## Порядок внедрения

1. ~~`POST /users/me/avatar` + папка `uploads/` + обновление `users.avatar`.~~ **Готово**
2. ~~UI загрузки в кабинете (клиент и фотограф).~~ **Готово**
3. Таблица `portfolio_works` + загрузка работ.
4. S3 + CDN на production.
