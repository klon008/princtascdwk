# TODO — технический план: коллекционные карты

> Документ для реализации.  
> `[x]` — решено или сделано. `[ ]` — в работе или открыто.

**Связанный документ:** [SPEC.md](./SPEC.md) — техническое задание по механике. Чеклист: [CHECKLIST.md](./CHECKLIST.md).

**Последнее обновление решений:** 2026-07-13 (архитектура: CloudPub)

---

## 0. Зафиксированные решения (MVP)

| Тема | Решение |
|------|---------|
| Связь бот ↔ сайт | **[x] CloudPub-туннель** + локальный HTTP API на ПК стримера; короткая ссылка `?u=&k=` |
| Туннель | **[x]** [CloudPub](https://cloudpub.ru/) — постоянный HTTPS-адрес, свой домен; поднимается на время стрима |
| Фронт | **[x]** GitHub Pages — только UI и статические арты; данные через `fetch` к API |
| Торговля / P2P | **[x] Не делаем**; простая архитектура; рефакторинг при необходимости в будущем |
| Модель инвентаря | **[x] §3.1** — `(user_id, card_id)` UNIQUE, одна карта типа на аккаунт |
| Дубли | **[x] §4.1** — 25% от `(booster_cost / cards_per_booster)` баллов; `floor`; карта не добавляется |
| Шансы редкости | **[x] Админка бустеров** (OBS) — стример задаёт при создании тиража |
| Терминология | **[x]** Коллекция / Серия / Бустер / Тираж / Альбом — см. [SPEC.md §2](./SPEC.md#2-глоссарий) |
| UI альбома | **[x]** Только полученные карты; без силуэтов отсутствующих; фильтры по сериям |
| Состав бустера | **[x] Promo JPG** — не на странице альбома |
| Ник на сайте | **[x] Обязательно** |
| Публичная ссылка | **[x] Да** — anyone with URL (пока API доступен) |
| `minted_by` / first pull | **[x] Нет** в MVP |
| Активный тираж | **[x] Один**; ротация между бустерами — [SPEC.md §6](./SPEC.md#6-бустер-и-тираж) |
| Тираж immutable | **[x]** Не редактируется; копия → новый id |
| Лимит чата GG | **[x]** ~4 КБ на сообщение — причина короткой ссылки, не payload в URL |

---

## 1. Контекст проекта

| Компонент | Статус | Путь / URL |
|-----------|--------|------------|
| Сайт-галерея | React + Vite, 27 карт захардкожены | [`src/app/App.tsx`](src/app/App.tsx) |
| Деплой | GitHub Pages, `base: /princtascdwk/` | [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) |
| Python-бот GoodGame | Есть, SQLite, баллы, соц. игры | отдельный репозиторий |
| Карты в боте | Не готово | — |
| Per-user альбом на сайте | Нет (планируется через API) | — |
| Админка бустеров (OBS) | Планируется | бот, `localhost` only |
| CloudPub-туннель | Планируется | [cloudpub.ru](https://cloudpub.ru/) |

**Ограничение:** GitHub Pages — только статика. Бот отдаёт JSON через локальный API; CloudPub публикует `localhost:8080` как `https://api.<домен>` без проброса домашнего IP.

**Лимит GoodGame:** сообщение в чате до ~4 КБ — ссылка `?u=&k=` должна оставаться короткой.

---

## 2. Архитектура связи бот ↔ сайт

### [x] Основной путь — CloudPub + локальный API (MVP)

```
Зритель → github.io/princtascdwk/?u=nick&k=TOKEN
              │
              └── fetch → https://api.<домен>/api/v1/album?u=nick&k=TOKEN
                                    │
                          CloudPub ─┘
                                    │
                          localhost:8080 (бот, SQLite)
```

| Компонент | Роль |
|-----------|------|
| SQLite на ПК | Источник правды: каталог, инвентарь, тиражи |
| HTTP API `:8080` | Read-only: альбом, счётчики прогресса |
| CloudPub | HTTPS-туннель; свой домен; только на время стрима |
| GH Pages | React UI; `VITE_API_BASE_URL`; арты карт |
| Админка OBS | Другой порт, **только** `127.0.0.1`, **не** в туннеле |

**Почему не `?c=`:** секрет и каталог в публичном репо; лимит URL и **~4 КБ чата GG**; не масштабируется при росте Коллекции. См. [SPEC.md §15](./SPEC.md#15-запасные-планы).

### [ ] CloudPub — настройка

- [ ] Аккаунт и тариф на [cloudpub.ru](https://cloudpub.ru/) (постоянный адрес, свой домен)
- [ ] DNS: CNAME `api.<домен>` → CloudPub
- [ ] Клиент на ПК стримера: туннель на `http://127.0.0.1:8080`
- [ ] Скрипт «стрим старт / стоп»: поднять API + туннель / остановить
- [ ] Проверка HTTPS и CORS с `https://<user>.github.io`

### [ ] Локальный API (бот)

- [ ] `GET /api/v1/album?u=<nick>&k=<token>` — альбом игрока
- [ ] `GET /api/v1/health` — для проверки туннеля (опц.)
- [ ] CORS: `Access-Control-Allow-Origin: https://<user>.github.io`
- [ ] Только `GET`; без админских операций
- [ ] Rate limit на IP (защита от сканирования через туннель)

### Отложено (не MVP)

- [ ] ~~JSON в репо через GitHub API~~
- [ ] ~~Supabase / Firebase~~
- [ ] Синхронизация на VPS ([Appendix B](#appendix-b-запасные-планы))

---

## 3. Модель инвентаря

### [x] 3.1 Простая: одна карта типа на пользователя (MVP)

```sql
CREATE TABLE user_cards (
  user_id       TEXT NOT NULL,   -- lowercase GoodGame nick
  card_id       TEXT NOT NULL,   -- slug: ariel, belle
  obtained_at   TEXT NOT NULL,
  booster_id    TEXT,            -- FK → boosters.id
  booster_name  TEXT,            -- snapshot для отображения на сайте
  PRIMARY KEY (user_id, card_id)
);
```

- Дубли **не создают** вторую строку
- Торговля **не поддерживается** — при добавлении trade потребуется миграция на instance-модель (§3.3 черновик)

### Отложено

- [ ] ~~3.2 quantity~~
- [ ] ~~3.3 instance~~ — только если вернётся торговля; см. [Appendix A](#appendix-a-черновик-для-будущей-торговли)

---

## 4. Дубли

### [x] 4.1 Правило: компенсация 25% за позицию в бустере

```python
per_card_cost = booster.cost_points // booster.cards_per_open  # или float, см. округление
duplicate_refund = round(per_card_cost * 0.25)  # зафиксировать округление в коде
```

**Пример:** cost=1000, cards=6 → per_card≈167 → refund≈42 за каждый дубль.

- [x] Карта **не добавляется** в `user_cards`
- [x] Баллы **начисляются обратно** на счёт пользователя в боте
- [x] Бот сообщает в чат: карта, факт дубля, сумма возврата
- [ ] Зафиксировать правило округления (floor / round / ceil)

### Не используем в MVP

- [ ] ~~3.1 no-dupe pool~~
- [ ] ~~3.3 second instance~~
- [ ] ~~3.4 upgrade to foil~~
- [ ] ~~3.5 silent ignore~~

---

## 5. Бустеры (админка OBS)

### [x] Стример создаёт бустеры через админку

```sql
CREATE TABLE boosters (
  id              TEXT PRIMARY KEY,   -- slug: fantast001
  name            TEXT NOT NULL,        -- «Тираж № 001»
  cost_points     INTEGER NOT NULL,
  cards_per_open  INTEGER NOT NULL,     -- e.g. 6
  is_active       INTEGER DEFAULT 1,
  promo_image_url TEXT,                 -- путь к .jpg или URL
  created_at      TEXT NOT NULL
);

-- Пул карт бустера
CREATE TABLE booster_pool (
  booster_id  TEXT NOT NULL,
  card_id     TEXT NOT NULL,
  PRIMARY KEY (booster_id, card_id)
);

-- Веса редкости (сумма = 100 или normalized weights)
CREATE TABLE booster_rarity_weights (
  booster_id  TEXT NOT NULL,
  rarity      TEXT NOT NULL,   -- common | uncommon | rare | epic | legendary | secretRare
  weight      REAL NOT NULL,
  PRIMARY KEY (booster_id, rarity)
);
```

### Логика открытия

- [ ] `!бустер [booster_id]` — default booster если один активный
- [ ] Для каждой из `cards_per_open` позиций:
  1. Roll rarity по `booster_rarity_weights`
  2. Pick random `card_id` from `booster_pool` с этой rarity (из каталога)
  3. If owned → refund 25%; else INSERT `user_cards`
- [ ] Log в `booster_openings`

```sql
CREATE TABLE booster_openings (
  opening_id      TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  booster_id      TEXT NOT NULL,
  opened_at       TEXT NOT NULL,
  cost_points     INTEGER NOT NULL,
  cards_rolled    TEXT NOT NULL,  -- JSON: [{card_id, is_duplicate, refund}, ...]
  total_refund    INTEGER DEFAULT 0
);
```

### Promo JPG

- [ ] Хранить изображение (файл в боте / static / CDN)
- [ ] Команда `!бустер инфо [id]` или OBS overlay — показ promo, **не** сайт коллекции
- [ ] На сайте альбома promo **не используется** (только landing без параметров альбома может иметь общий арт серии)

---

## 6. Каталог карт (контракт бот + сайт)

### 6.1 Stable slug-ID

| slug | princess | rarity |
|------|----------|--------|
| `cinderella` | Золушка | common |
| `belle` | Белль | uncommon |
| `ariel` | Ариэль | rare |
| `snow-white` | Белоснежка | common |
| `rapunzel` | Рапунцель | epic |
| `jasmine` | Жасмин | uncommon |
| `moana` | Моана | rare |
| `pocahontas` | Покахонтас | common |
| `aurora` | Аврора | legendary |
| `tiana` | Тиана | uncommon |
| `merida` | Мерида | rare |
| `asha` | Аша | common |
| `raya` | Рая | epic |
| `mulan` | Мулан | uncommon |
| `anna` | Анна | rare |
| `nala` | Нала | common |
| `queen-elsa` | Королева Эльза | secretRare |
| `megara` | Мегара | secretRare |
| `esmeralda` | Эсмеральда | rare |
| `jane` | Джейн | common |
| `mirabel` | Мирабель | epic |
| `tinker-bell` | Динь-Динь | uncommon |
| `kida` | Кида | rare |
| `giselle` | Жизель | uncommon |
| `flounder` | Флаундер | common |
| `olaf` | Олаф | common |
| `pascal` | Паскаль | common |

- [ ] Каталог — **источник правды в SQLite бота**; на сайт отдаётся через API (имена/редкость для owned-карт)
- [ ] На GH Pages — только slug → путь к арту (`/assets/...`) без полного JSON каталога в репо (минимум)
- [ ] Rarity только из каталога бота

---

## 7. Подпись ссылки и API-ответ

### 7.1 Подпись `k` (вместо шифрования всего альбома в URL)

Секрет **только** в `.env` бота (`ALBUM_LINK_SECRET`). На сайте секретов нет.

```python
# Псевдокод
payload = f"{nick_lower}:{exp_unix}"
k = hmac_sha256(ALBUM_LINK_SECRET, payload)[:16]  # или base64url
url = f"{SITE_BASE}/?u={nick}&k={k}&exp={exp_unix}"
```

API проверяет: `k` валиден, `exp` не истёк, `u` совпадает.

- [ ] Зафиксировать TTL подписи (например 24 ч или «до конца стрима»)
- [ ] `build_album_url(nick)` в боте
- [ ] `verify_album_token(u, k, exp)` в API

### 7.2 Ответ `GET /api/v1/album`

```json
{
  "v": 1,
  "u": "GoodGameNick",
  "series": [
    { "id": "fantast", "name": "Фантастический коллекционер", "owned": 12, "total": 27 }
  ],
  "collection": { "owned": 12, "total": 27 },
  "cards": [
    {
      "id": "ariel",
      "name": "Ариэль",
      "rarity": "rare",
      "d": "2026-07-12",
      "b": "Серия «Фантастический коллекционер» · Тираж № 001"
    }
  ]
}
```

| Поле | MVP | Примечание |
|------|-----|------------|
| `v` | да | версия API |
| `u` | да | ник на странице |
| `series[]` | да | прогресс по сериям |
| `collection` | да | общий счётчик |
| `cards[]` | да | только **owned**; display-поля с сервера |
| ~~`i` instance_id~~ | **нет** | только при trade refactor |
| ~~`m` minted_by~~ | **нет** | решено не делать |

- [ ] Python: FastAPI/Flask роут + чтение SQLite
- [ ] TS: [`src/lib/albumApi.ts`](src/lib/albumApi.ts) — `fetchAlbum(u, k, exp?)`
- [ ] Ошибки: 401 (подпись), 404 (нет игрока), 503 (туннель/API down)

### 7.3 Конфиг фронта

- [ ] `VITE_API_BASE_URL=https://api.<домен>` в GitHub Actions / `.env.local`
- [ ] **Не** коммитить `ALBUM_LINK_SECRET`
- [ ] `.env.local` в `.gitignore`

---

## 8. Команды бота (MVP)

| Команда | Действие | Статус |
|---------|----------|--------|
| `!бустер [id]` | Списать cost → roll N карт → dup refund | [ ] |
| `!альбом` | Короткая ссылка `?u=&k=`; данные с API | [ ] |
| `!бустер инфо [id]` | Текст + ссылка на promo JPG | [ ] |
| `!карты` | Краткий список в чат (опц.) | [ ] |

### Не MVP (торговля — отложено)

- [ ] ~~`!обмен`~~
- [ ] ~~`!выставить`~~
- [ ] ~~`!купить`~~

### Admin (OBS)

- [ ] CRUD boosters
- [ ] Редактор pool + rarity weights
- [ ] Загрузка promo JPG
- [ ] Admin grant card (опц., без P2P trade)

---

## 9. Изменения на сайте

### 9.1 Рефакторинг

- [ ] [`src/lib/albumApi.ts`](src/lib/albumApi.ts) — `fetch` к CloudPub API
- [ ] [`App.tsx`](src/app/App.tsx) — parse `?u=&k=`, загрузка альбома, **owned-only** grid
- [ ] Состояния: loading / error (API offline) / success

### 9.2 UI-режимы

| URL / состояние | Поведение | Статус |
|-----------------|-----------|--------|
| без `u` | Landing: «Получите ссылку через !альбом»; **без** полного каталога | [ ] |
| `?u=&k=` + API OK | Ник + сетка **только owned** + счётчики | [ ] |
| `?u=&k=` + API fail | «Альбом доступен на стриме» / туннель недоступен | [ ] |
| невалидная подпись | Ошибка «ссылка недействительна» (401 от API) | [ ] |

### 9.3 Явно НЕ делаем на сайте альбома

- [x] ~~Locked / unowned cards~~
- [x] ~~Силуэты «из 27» с пустыми слотами~~
- [x] ~~«Первым вытащил @User»~~
- [x] ~~Список карт бустера~~ → только promo JPG вне сайта

### 9.4 CI/CD

- [ ] `VITE_API_BASE_URL` в [deploy-pages.yml](.github/workflows/deploy-pages.yml)
- [ ] `.env.local` в `.gitignore`

---

## 10. Безопасность (MVP)

- [ ] Rate limit `!бустер` / `!альбом` в чате
- [ ] Rate limit на `GET /api/v1/album` (по IP)
- [ ] `user_id` = lowercase nick
- [ ] Log `booster_openings` для аудита
- [ ] Admin rollback: DELETE from `user_cards` + refund (ручная команда)
- [ ] Админка OBS **не** публикуется через CloudPub
- [ ] Туннель поднимается только на время стрима (снижение поверхности атаки)

### Не MVP

- [ ] ~~trade_lock~~
- [ ] ~~ownership_history~~
- [ ] ~~is_tradeable~~

---

## 11. Порядок реализации

### Фаза 1 — MVP

- [x] Решения зафиксированы (§0)
- [ ] §2 CloudPub: аккаунт, домен, скрипт старт/стоп туннеля
- [ ] §7 API + подпись `k` + CORS
- [ ] §3 SQLite `user_cards` + §5 boosters + openings
- [ ] §5 Админка создания бустеров (`localhost`)
- [ ] §8 `!бустер`, `!альбом`, dup refund
- [ ] §9 Сайт: fetch API, nick, owned-only grid, offline state
- [ ] §5 Promo JPG flow

### Фаза 2 — полировка

- [ ] Pity (если нужно)
- [ ] Admin grant card
- [ ] OBS overlay интеграция
- [ ] Алерт Secret Rare на стриме
- [ ] Автостарт туннеля вместе с OBS/ботом

### Фаза 3+ — только если понадобится

- [ ] Торговля → Appendix A, полный рефакторинг
- [ ] VPS / виртуальный хостинг → [Appendix B](#appendix-b-запасные-планы)

---

## 12. Открытые технические вопросы

- [ ] Счётчик на сайте: «12 карт» vs «12/27»
- [ ] Округление duplicate refund — зафиксировать `floor` в коде
- [ ] Cooldown / daily limit на бустер
- [ ] TTL подписи `k` (24 ч / до конца стрима / бессрочно)
- [ ] Default booster если несколько active
- [ ] Точная команда/конфиг CloudPub под Windows (ПК стримера)
- [ ] Альтернатива CloudPub, если сервис недоступен — см. Appendix B

**Ответы:**

```
```

---

## Appendix A: черновик для будущей торговли

> **Не реализовывать в MVP.** Сохранено на случай рефакторинга.

```sql
-- Миграция: user_cards → card_instances + ownership_history
-- + trade_offers, market_listings
-- + minted_by, instance_id в payload
-- + команды !обмен, !купить
```

При решении добавить trade — пересмотреть [SPEC.md §11](./SPEC.md#11-ограничения-mvp-обмен-между-игроками) и провести миграцию данных.

---

## Appendix B: запасные планы

> Если CloudPub не подходит. Подробнее: [SPEC.md §15](./SPEC.md#15-запасные-планы).

### B1 — Зашифрованный `?c=` в URL (fallback)

- Весь альбом в query; расшифровка на клиенте (`collectionToken.ts`)
- `COLLECTION_SECRET` в боте + `VITE_COLLECTION_SECRET` в CI (**минус безопасности**)
- Упирается в ~4 КБ чата GG и длину URL при росте Коллекции
- [ ] Использовать только как временный обход, не целевая архитектура

### B2 — Виртуальный хостинг / VPS

- API + PostgreSQL/SQLite на сервере; бот пушит изменения (webhook / cron)
- Альбом 24/7 без ПК стримера
- Стоимость и синхронизация — главные минусы
- [ ] Рассмотреть при требовании офлайн-доступа или торговли

### B3 — Другой туннель (если CloudPub заблокирован)

- Аналоги: xTunnel, ngrok (платный статический домен), frp на дешёвом VPS
- Архитектура та же: локальный API + туннель; меняется только клиент

---

*Обновлено: 2026-07-13*
