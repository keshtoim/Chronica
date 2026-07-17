import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSyncStore } from '@/store/syncStore'

const NAV_ITEMS = [
  { to: '/calendar', label: 'Календарь', icon: '📅' },
  { to: '/tasks', label: 'Задачи', icon: '✅' },
  { to: '/habits', label: 'Привычки', icon: '🔥' },
  { to: '/profile', label: 'Профиль', icon: '🧙' },
] as const

export function AppShell() {
  const syncNow = useSyncStore((state) => state.syncNow)

  useEffect(() => {
    void syncNow()
  }, [syncNow])

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 px-4 backdrop-blur-sm">
        <span className="text-lg font-medium">Chronica</span>
        <div className="flex-1" />
        <SyncStatusBadge />
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-[var(--color-border)] bg-[var(--color-bg)]/80 p-3 backdrop-blur-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
                ].join(' ')
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const STATUS_LABEL: Record<ReturnType<typeof useSyncStore.getState>['status'], string> = {
  idle: 'Синхронизация: ожидание',
  syncing: 'Синхронизация…',
  synced: 'Синхронизировано',
  error: 'Ошибка синхронизации',
}

function SyncStatusBadge() {
  const status = useSyncStore((state) => state.status)
  const error = useSyncStore((state) => state.error)
  const syncNow = useSyncStore((state) => state.syncNow)

  return (
    <button
      type="button"
      onClick={() => void syncNow()}
      title={error ?? undefined}
      className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)]"
    >
      {STATUS_LABEL[status]}
    </button>
  )
}
