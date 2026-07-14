# README_DEV_CARDS — коллекционные карты (сайт)

Документация для разработчика **фронта** (`princtascdwk`, GitHub Pages).  
Параллельный документ бота: в репозитории бота → [`README_DEV_CARDS.md`](https://github.com/klon008/ggchatbot/blob/main/README_DEV_CARDS.md) (локально: `E:\programs\OBS\botmsc\README_DEV_CARDS.md`).

Механика продукта: [SPEC.md](./SPEC.md) · техплан: [TODO_tech.md](./TODO_tech.md).

**Обновлено:** 2026-07-14

---

## 1. Роль сайта

GitHub Pages — **оболочка UI** и статические арты.  
Альбом игрока **не** лежит в репозитории: данные приходят с Album API бота (через CLO), параметры в URL:

```
https://USER.github.io/princtascdwk/?u=nick&k=TOKEN&exp=UNIX&api=ENC
```

| Параметр | Смысл |
|----------|--------|
| `u` | ник |
| `k` | HMAC-подпись (проверяет бот) |
| `exp` | срок жизни подписи |
| `api` | зашифрованный base URL CLO (AES-GCM) |

Секрет расшифровки: `VITE_ALBUM_LINK_SECRET` (= `ALBUM_LINK_SECRET` бота).  
Задаётся в **GitHub → Settings → Secrets → Actions** как `ALBUM_LINK_SECRET`; в `deploy-pages.yml` пробрасывается в `VITE_ALBUM_LINK_SECRET`.  
Локально: `.env.local` с `VITE_ALBUM_LINK_SECRET=...` (не коммитить).

Без `?u=`/`?k=` — landing («получите ссылку через !альбом»). В DEV без параметров может показываться превью полного каталога.

---

## 2. Структура файлов

```
src/
  imports/                 # арты: {slug}.webp, рубашки {back-id}.svg
  lib/
    cardCatalog.ts         # slug → имя, rarity, portrait (контракт с ботом)
    cardBacks.ts           # card_back_id → SVG
    albumApi.ts            # fetch альбома, типы ответа
    apiCodec.ts            # decrypt &api=
  app/
    App.tsx                # режимы landing / album / offline / …
    CardModal.tsx          # модалка + 3D
    cardDetails.json       # stories[slug] — источник лора (зеркало у бота)
    cardDetails.ts         # тонкая обёртка: getCardStory / getCardDetails
    demoCards.ts           # DEV-каталог
    cards/
      CardSVG.tsx          # лицо карты
      Card3DViewer.tsx     # 3D: лицо + рубашка
      CardTile.tsx
      CardBackTile.tsx     # только DEV-превью, не в !альбом
```

**Контракт slug:** id карты в боте = имя файла без расширения = ключ в `cardCatalog.ts`  
(пример: `queen-elsa`, `tinker-bell`, `elsa`).

---

## 3. Как добавить новую принцессу

Делай **и сайт, и бота** (см. README бота §3). На стороне сайта:

### 3.1 Файл арта

```
src/imports/{slug}.webp
```

Рекомендуемый aspect близок к карте 5∶7.

### 3.2 Каталог `src/lib/cardCatalog.ts`

1. `import myImg from "@/imports/{slug}.webp";`
2. Добавь `{slug}` в конец `CATALOG_ORDER` (порядок = «№ карты» в модалке).
3. `PORTRAITS[slug] = myImg`
4. `NAMES[slug] = "Русское имя"`
5. `RARITIES[slug] = "rare"` (или другая редкость из типа `RarityKey`)

### 3.3 История `src/app/cardDetails.json`

Ключ — **slug** (как в каталоге и в БД бота), не русское имя:

```json
{
  "v": 1,
  "stories": {
    "cinderella": "…текст…"
  }
}
```

`cardDetails.ts` только читает json (`getCardStory(slug)`).  
Дата/бустер в проде — с Album API; в DEV модалка подставляет заглушки.

После правки json: commit + push → Pages; у бота `update.cmd` скопирует зеркало в `data/cards/cardDetails.json` (админка, только чтение).

### 3.4 Бот

Миграция/SQL + `booster_pool` + sync webp в `obs/assets/cards` — иначе карта не выпадает и не видна в админке.

### 3.5 Проверка

```bash
npm run dev
# с мок-API или ботом на :18770 + ссылка !альбом
npm run build
```

---

## 4. Как добавить рубашку серии

Рубашка у **серии** (`card_series.card_back_id` в боте), API отдаёт `card_back_id` на каждой карте альбома.

### На сайте

1. Файл: `src/imports/{back-id}.svg` (сейчас дефолт: `card-back.svg`)
2. `src/lib/cardBacks.ts`:

```ts
import myBack from "@/imports/my-back.svg";

const CARD_BACKS = {
  "card-back": defaultBack,
  "my-back": myBack,
};
```

3. `Card3DViewer` / модалка берут `resolveCardBack(card.cardBackId)`.

### В боте

```sql
UPDATE card_series SET card_back_id = 'my-back' WHERE id = 'fantast';
```

Скопируй SVG в `botmsc/obs/assets/cards/my-back.svg` (sync копирует `card-back*.svg`).

**Не** клади рубашку в сетку альбома игрока — только owned-карты (SPEC). `CardBackTile` — для DEV-превью.

---

## 5. Режимы UI (`App.tsx`)

| Состояние | Когда |
|-----------|--------|
| `landing` | нет валидных `u`/`k`/`exp` |
| `loading` | идёт `fetchAlbum` |
| `album` | API 200 — сетка **только owned** |
| `offline` | сеть / 5xx |
| `unauthorized` | 401 (битая/протухшая подпись) |
| `not_found` | 404 |

Локальный fallback API без `&api=`: `http://127.0.0.1:18770` (только `npm run dev`).

---

## 6. Ответ API (что ждёт фронт)

```ts
{
  v: 1,
  u: "DisplayNick",
  series: [{ id, name, owned, total, card_back_id? }],
  collection: { owned, total },
  cards: [{
    id, name, rarity,
    series_id?, card_back_id?,
    d,           // дата
    b,           // подпись бустера/тиража
    image_url?   // для админки бота; сайт берёт portrait из cardCatalog
  }]
}
```

Портрет на GH Pages: всегда из `getCatalogEntry(id).portrait`, не из `image_url` бота (хеши Vite ≠ пути бота).

---

## 7. Деплой

`.github/workflows/deploy-pages.yml`:

- `base: /princtascdwk/` в Vite
- build с `VITE_ALBUM_LINK_SECRET: ${{ secrets.ALBUM_LINK_SECRET }}`

После смены секрета — пересобери Pages (иначе старый ключ в бандле).

---

## 8. Синхронизация с ботом

Источник правды файлов: **этот** репозиторий:

- `src/imports` — webp / svg
- `src/app/cardDetails.json` — лор (`stories[slug]`)

Бот при `update.cmd` тянет оба через `scripts/sync-card-assets.ps1` →  
`obs/assets/cards/` и `data/cards/cardDetails.json` (admin, только чтение).

После добавления webp/svg/json — push в `main`, затем у стримера `update.cmd`.

---

## 9. Чеклист новой карты (сайт)

- [ ] `src/imports/{slug}.webp`
- [ ] `cardCatalog.ts` (order, name, rarity, portrait)
- [ ] `cardDetails.json` → `stories[slug]`
- [ ] Push + Pages build
- [ ] На боте: миграция + pool + sync assets
- [ ] `!альбом` → карта в сетке, 3D рубашка серии верная

## 10. Чеклист новой рубашки

- [ ] `src/imports/{back-id}.svg`
- [ ] запись в `cardBacks.ts`
- [ ] бот: `card_series.card_back_id` + файл в `obs/assets/cards/`
- [ ] проверить 3D flip в модалке альбома
