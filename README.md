# Chronica

Календарь, планировщик задач и трекер привычек с игровыми элементами в духе Habitica.
Единое приложение без собственного сервера: работает как сайт, устанавливается как десктоп-приложение (Windows) и как Android-приложение — из одного кодбейса на React + TypeScript, обёрнутого в [Tauri v2](https://v2.tauri.app/).

Синхронизация между устройствами выполняется через резервную копию данных на Google Drive (сейчас реализована как локальная заглушка `MockLocalSyncProvider`, реальный провайдер на Google Drive API добавится позже).

## Стек

- **UI**: React + TypeScript + Vite, Tailwind CSS
- **Shell**: Tauri v2 (Windows exe, Android APK)
- **Данные**: Dexie.js (IndexedDB) — офлайн-first, локальная синхронизация с Google Drive
- **Состояние**: Zustand
- **Прочее**: dnd-kit (drag&drop), react-easy-crop (кроп фото), rrule.js (повторяющиеся события)

## Разработка

```bash
npm install
npm run dev          # сайт в браузере, http://localhost:5173
npm run build         # production-сборка сайта
npm run lint           # oxlint
npm run format         # prettier --write
npm run typecheck      # tsc -b
```

Для запуска десктопной Tauri-оболочки локально нужен установленный Rust-тулчейн ([rustup.rs](https://rustup.rs/)):

```bash
npm run tauri dev
```

## Структура

```
src/
├── app/            # роутинг, layout-оболочка приложения
├── modules/        # calendar, tasks, habits, gamification
├── data/           # Dexie-схема и репозитории (Phase 1)
├── sync/           # SyncProvider / SyncEngine (Phase 1)
├── theming/         # фон приложения, кроп фото (Phase 5)
├── store/           # Zustand-сторы
└── components/       # переиспользуемые UI-компоненты
src-tauri/           # Rust-оболочка Tauri
```

## Сборка и релизы

GitHub Actions собирает три артефакта: web (деплой на GitHub Pages), Windows .exe и Android .apk. Подробности — в `.github/workflows/`.
