## Nutrition API

Backend для трекинга питания и приёмов пищи:

- NestJS + Prisma + PostgreSQL  
- Kafka + отдельный Python‑сервис (`Food_Detection`) для распознавания блюд по фото  
- Автоматический расчёт КБЖУ при создании приёма пищи на основе блюд и их веса

---

## Запуск через Docker Compose

Требования:

- Docker / Docker Desktop
- Docker Compose

### 0. Подготовка сервиса распознавания блюд

В корне проекта (там же, где лежит `docker-compose.yml`) нужно склонировать репозиторий с сервисом детекции еды:

```bash
git clone https://github.com/daniil-karpov-1996/Food_Detection.git
mv Food_Detection food_detection
```

В результате должна появиться папка `food_detection` рядом с `docker-compose.yml`, т.к. `docker-compose` использует её как build‑контекст для контейнера `food_detector`.

### 1. Переменные окружения

Создай файл `.env` в корне проекта (рядом с `docker-compose.yml`), пример:

```env
POSTGRES_USER=nutrition
POSTGRES_PASSWORD=nutrition
POSTGRES_DB=nutrition

DATABASE_URL=postgresql://nutrition:nutrition@postgres:5432/nutrition?schema=public

KAFKA_BROKERS=kafka:29092
KAFKA_IMAGE_RECOGNITION_TOPIC=food_images
KAFKA_IMAGE_RECOGNITION_RESPONSE_TOPIC=food_cls
KAFKA_IMAGE_RECOGNITION_CONSUMER_GROUP=nutrition-image-recognition

JWT_ACCESS_SECRET=access-secret
JWT_REFRESH_SECRET=refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> Важно: внутри docker‑сети Postgres и Kafka доступны как `postgres` и `kafka`, а не `localhost`.

### 2. Собрать и поднять весь стек

Из корня проекта:

```bash
docker compose up --build
```

Будут подняты:

- `postgres` — база данных
- `zookeeper` + `kafka` — брокер сообщений
- `food_detector` — Python‑сервис с YOLO, слушает Kafka и классифицирует блюда
- `backend` — NestJS‑приложение

После старта:

- Backend: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`

### 3. Применить миграции и сиды (если нужно руками)

Если запускаешь backend локально (не в контейнере) и хочешь прогнать миграции/сиды:

```bash
pnpm install

npx prisma migrate dev
pnpm prisma db seed

pnpm run start:dev
```

При запуске всего через `docker compose up --build` Prisma‑миграции и сиды тоже можно выполнять из контейнера backend’а, если потребуется.

---

## Локальная разработка без Docker

1. Поднять Postgres (например, через локальный Docker контейнер) и выставить `DATABASE_URL`.
2. Установить зависимости:

```bash
pnpm install
```

3. Применить миграции и сиды:

```bash
npx prisma migrate dev
pnpm prisma db seed
```

4. Запустить backend:

```bash
pnpm run start:dev
```

Kafka и `food_detector` в этом случае можно поднять отдельно или временно отключить функциональность распознавания.*** End Patch***"}]}/>
