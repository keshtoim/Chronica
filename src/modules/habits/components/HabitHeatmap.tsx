import { useMemo } from 'react'
import { addDays, startOfDay, startOfWeek, toDateKey } from '@/modules/calendar/dateUtils'
import type { HabitEntity } from '@/data/entities'

const WEEKS = 12

interface Props {
  habit: HabitEntity
  onToggleDate: (date: Date) => void
}

export function HabitHeatmap({ habit, onToggleDate }: Props) {
  const today = startOfDay(new Date())
  const doneDates = useMemo(
    () => new Set(habit.completions.filter((entry) => entry.count > 0).map((entry) => entry.date)),
    [habit.completions],
  )

  const gridStart = startOfWeek(addDays(today, -(WEEKS - 1) * 7))
  const totalDays = WEEKS * 7
  const days = Array.from({ length: totalDays }, (_, index) => addDays(gridStart, index))

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {days.map((day) => {
        const isFuture = day > today
        const key = toDateKey(day)
        const done = doneDates.has(key)
        return (
          <button
            key={key}
            type="button"
            disabled={isFuture}
            onClick={() => onToggleDate(day)}
            title={`${key}${done ? ' — выполнено' : ''}`}
            className={[
              'h-3 w-3 rounded-sm transition-colors',
              isFuture ? 'invisible' : '',
              done ? '' : 'bg-[var(--color-surface-hover)]',
            ].join(' ')}
            style={done ? { backgroundColor: habit.color ?? '#1a73e8' } : undefined}
          />
        )
      })}
    </div>
  )
}
