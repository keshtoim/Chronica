# Chronica

**English** · [Русский](README.ru.md)

Calendar, task planner, and habit tracker with Habitica-style gamification — one app, no backend server of its own. Ships as a website, a Windows desktop app, and an Android app from a single codebase.

## Features

- 🏠 **Dashboard** — Habitica-style home screen: level/XP/HP/gold at a glance, today's tasks and events, habits, and the rewards shop in one view
- 📅 **Calendar** — month/week/day/agenda views, recurring events (RRULE), drag to move or resize, all-day and multi-day events
- ✅ **Tasks** — Google Tasks-style lists with nested subtasks; sort manually, by creation date, or by due date (subtasks keep their parent visible for context)
- 🔥 **Habits** — daily/weekly/custom-schedule habits, streaks, a GitHub-style completion heatmap
- 🧙 **Gamification** — XP, levels, gold, HP, a custom rewards shop, and achievements unlocked by real progress (levels, completions, streaks); completing tasks and habits grants rewards, missed dailies cost HP
- 📜 **Merchant** — spend gold on a "skip scroll" from the shop to forgive a missed habit day without breaking your streak or losing HP
- 👋 **Onboarding** — a short first-launch tour explaining each section before you land on the dashboard
- 🎨 **Theming** — crop your own photo onto any task or event, customize the app background (crop, blur, filters), premium glassmorphism UI with Framer Motion animations
- 📱 **Mobile-friendly** — responsive layout with a bottom tab bar on small screens, safe-area aware for notches/gesture bars
- 🔄 **Cross-device sync** via each user's own Google Drive (`appDataFolder`) — OAuth flows for web (Google Identity Services), desktop (loopback + PKCE), and Android (deep link + PKCE); falls back to a local mock provider until you connect an account, behind a swappable `SyncProvider` interface
- 📦 **No server** — the same codebase runs as a website, an installable Windows desktop app, and an Android app

## Tech stack

| Layer          | Choice                                                        |
| -------------- | -------------------------------------------------------------- |
| UI             | React + TypeScript + Vite, Tailwind CSS, Framer Motion         |
| Shell          | [Tauri v2](https://v2.tauri.app/) (Windows exe, Android APK)  |
| Local data     | Dexie.js (IndexedDB), offline-first                            |
| State          | Zustand                                                        |
| Drag & drop    | dnd-kit                                                        |
| Recurrence     | rrule.js                                                       |
| Photo cropping | react-easy-crop                                                |

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
├── modules/        # dashboard, onboarding, calendar, tasks, habits, gamification, settings
├── data/           # Dexie schema and repositories
├── sync/           # SyncProvider / SyncEngine / Google Drive OAuth
├── media/          # photo picker, cropping, media storage
├── store/          # Zustand stores
└── components/     # shared UI components
src-tauri/           # Tauri Rust shell
```

## Sync

Cross-device sync pulls a data snapshot on launch, merges local changes (last-write-wins per record), and pushes back. `GoogleDriveSyncProvider` stores the snapshot in the signed-in user's own Google Drive `appDataFolder` — no data ever touches a server Chronica controls. Until an account is connected, sync runs against a local `MockLocalSyncProvider` behind the same interface, so calling code never branches on backend.

## Builds & releases

GitHub Actions builds three artifacts on every `v*` tag: the web app (deployed to GitHub Pages), a Windows `.exe`, and an Android `.apk` — the Windows and Android workflows attach their installers to the same GitHub Release draft. See `.github/workflows/` for details.
