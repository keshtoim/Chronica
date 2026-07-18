import { habitsRepository } from '@/data/repositories/habitsRepository'
import { toggleHabitCompletion } from '@/modules/habits/habitActions'
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
}

export function HabitCard({ habit }: Props) {
  const todayKey = toDateKey(new Date())
  const doneToday = habit.completions.some((entry) => entry.date === todayKey && entry.count > 0)

  async function handleDelete() {
    if (!window.confirm(`Удалить привычку «${habit.title}»?`)) return
    await habitsRepository.remove(habit.id)
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{habit.title}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{frequencyLabel(habit)}</p>
        </div>
        <button
          type="button"
          onClick={() => void toggleHabitCompletion(habit)}
          className={[
            'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            doneToday
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
              : 'border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]',
          ].join(' ')}
        >
          {doneToday ? '✓ Выполнено сегодня' : 'Отметить выполненным'}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span>🔥 Стрик: {habit.currentStreak}</span>
        <span>🏆 Лучший: {habit.bestStreak}</span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <HabitHeatmap
          habit={habit}
          onToggleDate={(date) => void toggleHabitCompletion(habit, date)}
        />
      </div>

      <button
        type="button"
        onClick={() => void handleDelete()}
        className="mt-3 text-xs text-[var(--color-danger)] hover:underline"
      >
        Удалить привычку
      </button>
    </div>
  )
}
