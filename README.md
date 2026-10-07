# FantPub 2.0 — рассказ на каждый день

Веб-приложение «книга дня» в духе Apple Books: каждый день открывается один короткий рассказ — классика из общественного достояния, часть в новых переводах. Автор спрятан до финала; перед чтением — лист книги, во время чтения — только текст, после — угадай автора, реакция, записка домового Пабчика. Обложки — живопись из открытых музейных коллекций.

- `web/` — приложение (Next.js 16, App Router, CSS Modules, без WebGL). Стекло — только на навигации (`.glass` в `globals.css`), обложки — `components/ui/Book.tsx`.
- `web/content/stories/*.md` — рассказы (frontmatter + текст), `web/content/authors.json` — авторы.
- `research/` — продуктовые исследования; `research/redesign/` — редизайн: Mobbin/Apple Books, Liquid Glass, тренды, техника, подбор обложек, аудит, `BUILD_SPEC.md`.
- `tools/` — генерация картинок через Codex CLI и headless-скриншоты для QA.

## Как добавить рассказ

1. Создать `web/content/stories/<slug>.md` по образцу соседних файлов. Поле `issue` — номер выпуска; дата выхода считается от `LAUNCH_DATE` в `web/src/lib/date.ts` (выпуск № 1 = дата запуска, каждый следующий +1 день, смена в 00:00 МСК).
2. Если автора ещё нет — добавить его в `authors.json`. Слаг рассказа не должен называть автора (слепое чтение).
3. Обложка: подобрать картину в общественном достоянии (Met, AIC, NGA, SMK, Cleveland — CC0), добавить её в `research/redesign/05_cover_art.json` и `covers_pick.json`, скачать в `research/redesign/covers_src/<slug>.jpg`, затем `python3 tools/build-covers.py <slug>` и `cd web && node scripts/og-covers.mjs`.
4. Закоммитить: Vercel пересоберёт сайт. Будущие выпуски до своей даты отдают 404 и не попадают в sitemap.

## Локально

```bash
cd web && npm install && npm run dev
```

## Переменные окружения (Vercel)

| Переменная | Зачем |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | канонический адрес сайта (OG, sitemap) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis для общих счётчиков реакций; без них реакции сохраняются только у читателя |
| `CRON_SECRET` | защита cron-маршрута ежедневной смены выпуска (уже задан) |
| `NEXT_PUBLIC_ANALYTICS` | `1` — включить Vercel Web Analytics (сначала включите Analytics в настройках проекта) |
