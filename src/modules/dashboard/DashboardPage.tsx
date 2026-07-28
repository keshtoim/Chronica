import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGamificationProfile } from '@/modules/gamification/hooks/useGamificationProfile'
import { xpToNextLevel } from '@/modules/gamification/engine'
import { RewardsShop } from '@/modules/gamification/components/RewardsShop'
import { AchievementsPanel } from '@/modules/gamification/components/AchievementsPanel'
import { useHabits } from '@/modules/habits/hooks/useHabits'
import { HabitCard } from '@/modules/habits/components/HabitCard'
import { TodayColumn } from '@/modules/dashboard/components/TodayColumn'
import { useGameEventStore } from '@/store/gameEventStore'

const SHADOW_SOFT = '0 4px 20px rgba(99, 102, 241, 0.08)'
const SHADOW_GLOW = '0 0 24px rgba(139, 92, 246, 0.45)'

function GradientBar({
  value,
  max,
  background,
}: {
  value: number
  max: number
  background: string
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
      <motion.div
        className="h-full rounded-full"
        style={{ background }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

/** Кратковременный glow+pulse на карточке персонажа при повышении уровня. */
function useLevelUpGlow(): boolean {
  const events = useGameEventStore((state) => state.events)
  const [glowing, setGlowing] = useState(false)
  const handledId = useRef<string | null>(null)

  useEffect(() => {
    const levelup = events.find((event) => event.type === 'levelup')
    if (levelup && levelup.id !== handledId.current) {
      handledId.current = levelup.id
      setGlowing(true)
      const timer = window.setTimeout(() => setGlowing(false), 1200)
      return () => window.clearTimeout(timer)
    }
  }, [events])

  return glowing
}

export function DashboardPage() {
  const profile = useGamificationProfile()
  const habits = useHabits()
  const isGlowing = useLevelUpGlow()

  if (!profile) return null

  const xpNeeded = xpToNextLevel(profile.level)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
      <motion.div
        animate={{ boxShadow: isGlowing ? SHADOW_GLOW : SHADOW_SOFT, scale: isGlowing ? 1.015 : 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-card-lg border border-[var(--color-border)] bg-[var(--color-glass)] p-5 backdrop-blur-md"
      >
        <div>
          <h1 className="text-lg font-semibold">Уровень {profile.level}</h1>
          <p className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            {profile.xp} / {xpNeeded} XP
          </p>
          <GradientBar value={profile.xp} max={xpNeeded} background="var(--gradient-xp)" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1.5 text-xs text-[var(--color-text-muted)]">
              ❤️ HP: {profile.hp} / {profile.maxHp}
            </p>
            <GradientBar value={profile.hp} max={profile.maxHp} background="var(--color-success)" />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-[var(--color-text-muted)]">💰 Золото</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-gold)' }}>
              {profile.gold}
            </p>
          </div>
        </div>
      </motion.div>

      <AchievementsPanel profile={profile} habits={habits ?? []} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-glass)] p-4 shadow-soft backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Привычки</h2>
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
