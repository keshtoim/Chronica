import type { CalendarViewMode } from '@/modules/calendar/dateUtils'

const VIEW_OPTIONS: { mode: CalendarViewMode; label: string }[] = [
  { mode: 'month', label: 'Месяц' },
  { mode: 'week', label: 'Неделя' },
  { mode: 'day', label: 'День' },
  { mode: 'agenda', label: 'Повестка дня' },
]

interface Props {
  view: CalendarViewMode
  onViewChange: (view: CalendarViewMode) => void
  label: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onCreate: () => void
}

export function CalendarToolbar({
  view,
  onViewChange,
  label,
  onPrev,
  onNext,
  onToday,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
      <button
        type="button"
        onClick={onCreate}
        className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent-contrast)]"
      >
        + Создать
      </button>

      <button
        type="button"
        onClick={onToday}
        className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
      >
        Сегодня
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Предыдущий период"
          className="rounded-full px-2 py-1 hover:bg-[var(--color-surface-hover)]"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Следующий период"
          className="rounded-full px-2 py-1 hover:bg-[var(--color-surface-hover)]"
        >
          →
        </button>
      </div>

      <h1 className="text-lg font-medium capitalize">{label}</h1>

      <div className="flex-1" />

      <div className="flex gap-1 rounded-full border border-[var(--color-border)] p-1">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => onViewChange(option.mode)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              option.mode === view
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
