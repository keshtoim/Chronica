# Chronica

**English** · [Русский](README.ru.md)

Calendar, task planner, and habit tracker with Habitica-style gamification — one app, no backend server of its own. Ships as a website, a Windows desktop app, and an Android app from a single codebase.

## Features

- 📅 **Calendar** — month/week/day/agenda views, recurring events (RRULE), drag to move or resize, all-day and multi-day events
- ✅ **Tasks** — Google Tasks-style lists with nested subtasks; sort manually, by creation date, or by due date (subtasks keep their parent visible for context)
- 🔥 **Habits** — daily/weekly/custom-schedule habits, streaks, a GitHub-style completion heatmap
- 🧙 **Gamification** — XP, levels, gold, HP, and a custom rewards shop; completing tasks and habits grants rewards, missed dailies cost HP
- 🎨 **Theming** — crop your own photo onto any task or event, customize the app background (crop, blur, filters)
- 🔄 **Cross-device sync** via a Google Drive backup (currently a local mock provider behind a swappable `SyncProvider` interface — a real Google Drive-backed provider is planned)
- 📦 **No server** — the same codebase runs as a website, an installable Windows desktop app, and an Android app

## Tech stack

| Layer          | Choice                                                       |
| -------------- | ------------------------------------------------------------ |
| UI             | React + TypeScript + Vite, Tailwind CSS                      |
| Shell          | [Tauri v2](https://v2.tauri.app/) (Windows exe, Android APK) |
| Local data     | Dexie.js (IndexedDB), offline-first                          |
| State          | Zustand                                                      |
| Drag & drop    | dnd-kit                                                      |
| Recurrence     | rrule.js                                                     |
| Photo cropping | react-easy-crop                                              |

## Getting started

```bash
npm install
npm run dev          # web app at http://localhost:5173
npm run build         # production web build
npm run lint           # oxlint
npm run format         # prettier --write
npm run typecheck      # tsc -b
```

Running the desktop shell locally requires a Rust toolchain ([rustup.rs](https://rustup.rs/)):

```bash
npm run tauri dev
```

## Project structure

```
src/
├── app/            # routing, app shell/layout
├── modules/        # calendar, tasks, habits, gamification, settings
├── data/           # Dexie schema and repositories
├── sync/           # SyncProvider / SyncEngine
├── media/          # photo picker, cropping, media storage
├── store/          # Zustand stores
└── components/     # shared UI components
src-tauri/           # Tauri Rust shell
```

## Sync

Cross-device sync pulls a data snapshot on launch, merges local changes, and pushes back — currently implemented against a local `MockLocalSyncProvider`. A real Google Drive-backed provider will replace it behind the same `SyncProvider` interface, with no changes needed in calling code.

## Builds & releases

GitHub Actions builds three artifacts: the web app (deployed to GitHub Pages), a Windows `.exe`, and an Android `.apk`. See `.github/workflows/` for details.
