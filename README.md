# Гэр бүлийн мод — Family Tree

Монгол гэр бүлийн **ургийн модыг** интерактивээр харуулах, засварлах веб апп.
Газрын зураг шиг чирч (pan) томруулж (zoom) үзэх нийтийн дэлгэц, мөн картыг чирч
байрлуулах, хүн нэмэх/засах админ самбартай. Бүх хэрэглэгч **нэг ерөнхий модыг**
хуваалцана (өгөгдөл серверт хадгалагдана).

## Боломжууд

- **Нийтийн харагдац** (`/`) — pan/zoom, хүн дээр дарж намтрыг үзэх.
- **Админ** (`/admin`) — картыг чирэх, хүн/хань/хүүхэд/эцэг нэмэх, зураг оруулах,
  «Цэгцлэх» (tidy-tree автомат байрлуулалт), JSON экспорт.
- **Автомат байрлуулалт** — хүн нэмэх бүрт давхцлыг арилгаж цэгцэлнэ.
- **Зураг** — хөргийг browser дээр шахаж (max 320px JPEG) tree-д хадгална.
- **Серверийн хадгалалт** — өгөгдөл болон зургийг сервер дискэн дээрх JSON-д хадгална.

## Технологи

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- Серверийн хадгалалт: дискэн дээрх JSON файл (`data/tree.json`)

## Локал хөгжүүлэлт

```bash
npm install
npm run dev          # http://localhost:3000
```

`npm run lint` — eslint · `npm run build` — production build · `npm run start` — production server.

## Өгөгдлийн загвар ба хадгалалт

- Бүх хэрэглэгч серверийн нэг модыг хуваалцана. API:
  - `GET /api/tree` — одоогийн мод (JSON).
  - `PUT /api/tree` — модыг шалгаж хадгална (POST мөн дэмжинэ — `sendBeacon`-д).
- Файл байршил: **`data/tree.json`** (анхдагч). Зургууд нь энэ JSON дотор
  base64-аар багтсан тул тусдаа файл шаардахгүй.
- Байршлыг `TREE_DATA_DIR` орчны хувьсагчаар өөрчилнө.
- Client тал: `lib/treeClient.ts` (fetch), `lib/useFamilyTree.ts` (debounce-той
  хадгалалт, алдаа гарвал автомат дахин оролдоно).
- Сервер тал: `lib/serverStore.ts` (атомар бичилт, зэрэг бичилтийг дараалуулна).

### Seed (анхны) өгөгдөл

Анхны мод нь **`12 бүртгэл.xlsx`**-аас үүсгэсэн жинхэнэ өгөгдөл —
дээд талд «Дээдэс» хос, доор нь **12 өрхийн** удам (нийт ~178 хүн).
Файл: `lib/sampleData.ts` (`sampleTree()`).

Серверт seed-ийг ачаалах 2 арга:

1. **Автоматаар** — шинэ сервер дээр `data/tree.json` байхгүй бол анхны
   хүсэлтэд `sampleTree()`-ээр үрлэж дискэнд бичнэ.
2. **Админаас** — `/admin` → «Жишээ модыг сэргээх» товч нь seed-ийг серверт
   дахин хадгална (одоогийн өөрчлөлтийг дарж бичнэ).

Excel өөрчлөгдвөл seed-ийг дахин үүсгэх:

```bash
node scripts/gen-seed-from-xlsx.mjs    # lib/sampleData.ts-ийг дахин бичнэ
```

## Production deploy (өөрийн сервер / VPS)

```bash
npm ci
npm run build
PORT=3000 TREE_DATA_DIR=/var/lib/family-tree npm run start
```

Анхаарах зүйлс:

- **`data/` фолдер (эсвэл `TREE_DATA_DIR`) байнгын дискэн дээр** байх ёстой —
  энд бүх өгөгдөл, зураг хадгалагдана. Backup хийхэд энэ нэг файлыг хуулна.
- Docker бол энэ фолдерыг **volume** болгож mount хий:
  ```bash
  docker run -p 3000:3000 -e TREE_DATA_DIR=/data -v family-tree-data:/data <image>
  ```
- Урд талд **reverse proxy** (Nginx/Caddy) тавьж HTTPS өг.
- Процессыг `systemd` эсвэл `pm2`-оор тогтвортой ажиллуул.
- Энэ нь **нэг instance**-д тохирно. Олон instance (scale-out) хэрэгтэй бол
  `lib/serverStore.ts`-ийг жинхэнэ DB рүү солино (интерфейс нь өөрчлөлтөд бэлэн).

### Жишээ systemd unit

```ini
[Unit]
Description=Family Tree
After=network.target

[Service]
WorkingDirectory=/opt/family-tree
Environment=PORT=3000
Environment=TREE_DATA_DIR=/var/lib/family-tree
ExecStart=/usr/bin/npm run start
Restart=always

[Install]
WantedBy=multi-user.target
```

## Төслийн бүтэц

```
app/
  page.tsx            # нийтийн харагдац
  admin/page.tsx      # админ самбар
  api/tree/route.ts   # GET/PUT/POST — серверийн хадгалалт
components/
  tree/               # карт, холбоос, viewport (pan/zoom)
  admin/              # чирэх, засварлагч, toolbar
  ui/                 # чимэглэлийн бүрэлдэхүүн
lib/
  types.ts            # домэйн төрлүүд
  tree.ts             # цэвэр функцууд (нэмэх/засах/холбох)
  builder.ts          # хурдан барих (хань/хүүхэд/эцэг нэмэх)
  layout.ts           # холбоосын геометр + bounds
  autoArrange.ts      # tidy-tree автомат байрлуулалт
  storage.ts          # validate/export
  serverStore.ts      # дискэн дээрх хадгалалт (сервер)
  treeClient.ts       # /api/tree fetch (client)
  useFamilyTree.ts    # ачаалал + debounce хадгалалт hook
  sampleData.ts       # seed (12 бүртгэл.xlsx-аас)
scripts/
  gen-seed-from-xlsx.mjs   # Excel → sampleData.ts генератор
```
