import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSyncStore } from '@/store/syncStore'
import { runDailyPenaltyCheck } from '@/modules/habits/dailyPenaltyCheck'
import { useApplyBackgroundSettings } from '@/modules/settings/hooks/useApplyBackgroundSettings'
import { GameEventToaster } from '@/modules/gamification/components/GameEventToaster'
import { checkAndUnlockAchievements } from '@/modules/gamification/achievements'
import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { habitsRepository } from '@/data/repositories/habitsRepository'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Главная', icon: '🏠' },
  { to: '/calendar', label: 'Календарь', icon: '📅' },
  { to: '/tasks', label: 'Задачи', icon: '✅' },
  { to: '/habits', label: 'Привычки', icon: '🔥' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' },
] as const

export function AppShell() {
  const syncNow = useSyncStore((state) => state.syncNow)
  useApplyBackgroundSettings()

  useEffect(() => {
    void syncNow()
    void runDailyPenaltyCheck()
    void (async () => {
      const [profile, habits] = await Promise.all([
        gamificationRepository.get(),
        habitsRepository.list(),
      ])
      await checkAndUnlockAchievements({ profile, habits })
    })()
  }, [syncNow])

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-glass)] px-4 backdrop-blur-md [padding-top:env(safe-area-inset-top)] [height:calc(3.5rem+env(safe-area-inset-top))]">
        <span className="text-lg font-semibold">Chronica</span>
        <div className="flex-1" />
        <SyncStatusBadge />
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-[var(--color-border)] bg-[var(--color-glass)] p-3 backdrop-blur-md md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-button px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'text-[var(--color-accent-contrast)] shadow-soft'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
                ].join(' ')
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--gradient-primary)' } : undefined
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

      <nav className="flex shrink-0 items-stretch border-t border-[var(--color-border)] bg-[var(--color-glass)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]',
              ].join(' ')
            }
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <GameEventToaster />
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
