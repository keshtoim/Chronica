import { habitsRepository } from '@/data/repositories/habitsRepository'
import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { toggleHabitCompletion, skipHabitDay } from '@/modules/habits/habitActions'
import { useGamificationProfile } from '@/modules/gamification/hooks/useGamificationProfile'
import { HabitHeatmap } from '@/modules/habits/components/HabitHeatmap'
import { toDateKey } from '@/modules/calendar/dateUtils'
import type { HabitEntity } from '@/data/entities'

const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function frequencyLabel(habit: HabitEntity): string {
  if (habit.frequency.type === 'daily') return 'Каждый день'
  if (habit.frequency.type === 'weekly') return 'Каждую неделю'
  const days = (habit.frequency.daysOfWeek ?? []).map((day) => WEEKDAY_LABELS[day]).join(', ')
  return days ? `По дням: ${days}` : 'Особые дни'
}

interface Props {
  habit: HabitEntity
  /** Компактный вид для дашборда — без heatmap и удаления, только суть: название, стрик, отметка. */
  compact?: boolean
}

export function HabitCard({ habit, compact = false }: Props) {
  const profile = useGamificationProfile()
  const todayKey = toDateKey(new Date())
  const doneToday = habit.completions.some((entry) => entry.date === todayKey && entry.count > 0)
  const skippedToday = (habit.skippedDates ?? []).includes(todayKey)

  async function handleDelete() {
    if (!window.confirm(`Удалить привычку «${habit.title}»?`)) return
    await habitsRepository.remove(habit.id)
  }

  async function handleSkip() {
    if (!profile || profile.skipScrolls <= 0) return
    await gamificationRepository.update({ skipScrolls: profile.skipScrolls - 1 })
    await skipHabitDay(habit)
  }

  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-[var(--color-border)] p-3'
          : 'rounded-xl border border-[var(--color-border)] p-4'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={compact ? 'text-sm font-medium' : 'font-medium'}>{habit.title}</h3>
          {!compact && (
            <p className="text-xs text-[var(--color-text-muted)]">{frequencyLabel(habit)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void toggleHabitCompletion(habit)}
          className={[
            'shrink-0 rounded-full font-medium transition-colors',
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            doneToday
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
              : 'border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]',
          ].join(' ')}
        >
          {doneToday ? '✓' : compact ? 'Отметить' : 'Отметить выполненным'}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span>🔥 Стрик: {habit.currentStreak}</span>
        {!compact && <span>🏆 Лучший: {habit.bestStreak}</span>}
      </div>

      {!compact && (
        <>
          <div className="mt-3 overflow-x-auto">
            <HabitHeatmap
              habit={habit}
              onToggleDate={(date) => void toggleHabitCompletion(habit, date)}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="text-xs text-[var(--color-danger)] hover:underline"
            >
              Удалить привычку
            </button>

            {!doneToday && !skippedToday && (
              <button
                type="button"
                onClick={() => void handleSkip()}
                disabled={!profile || profile.skipScrolls <= 0}
                title="Закрыть сегодняшний день свитком пропуска, без урона HP"
                className="rounded-button border border-[var(--color-border)] px-2.5 py-1 text-xs hover:bg-[var(--color-surface-hover)] disabled:opacity-40"
              >
                📜 Пропустить свитком {profile ? `(${profile.skipScrolls})` : ''}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
