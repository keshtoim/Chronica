import { Link } from 'react-router-dom'
import { useGamificationProfile } from '@/modules/gamification/hooks/useGamificationProfile'
import { xpToNextLevel } from '@/modules/gamification/engine'
import { RewardsShop } from '@/modules/gamification/components/RewardsShop'
import { useHabits } from '@/modules/habits/hooks/useHabits'
import { HabitCard } from '@/modules/habits/components/HabitCard'
import { TodayColumn } from '@/modules/dashboard/components/TodayColumn'

function ProgressBar({ value, max, colorVar }: { value: number; max: number; colorVar: string }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
      <div
        style={{ width: `${percent}%`, backgroundColor: colorVar }}
        className="h-full rounded-full transition-[width]"
      />
    </div>
  )
}

export function DashboardPage() {
  const profile = useGamificationProfile()
  const habits = useHabits()

  if (!profile) return null

  const xpNeeded = xpToNextLevel(profile.level)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
      <div className="rounded-xl border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            🧙
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-medium">Уровень {profile.level}</h1>
            <p className="mb-1 text-xs text-[var(--color-text-muted)]">
              {profile.xp} / {xpNeeded} XP
            </p>
            <ProgressBar value={profile.xp} max={xpNeeded} colorVar="var(--color-accent)" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs text-[var(--color-text-muted)]">
              ❤️ HP: {profile.hp} / {profile.maxHp}
            </p>
            <ProgressBar value={profile.hp} max={profile.maxHp} colorVar="var(--color-danger)" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">💰 Золото</p>
            <p className="text-lg font-medium">{profile.gold}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Привычки</h2>
            <Link to="/habits" className="text-xs text-[var(--color-accent)] hover:underline">
              Все привычки →
            </Link>
          </div>

          {habits === undefined ? null : habits.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Пока нет привычек — добавь их на странице «Привычки».
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} compact />
              ))}
            </div>
          )}
        </div>

        <TodayColumn />

        <RewardsShop profile={profile} />
      </div>
    </div>
  )
}
