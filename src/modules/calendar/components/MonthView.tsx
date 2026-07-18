import { addDays, isSameDay, startOfDay, RU_WEEKDAYS_SHORT } from '@/modules/calendar/dateUtils'
import type { EventOccurrence } from '@/modules/calendar/occurrences'

interface Props {
  days: Date[]
  cursorDate: Date
  occurrences: EventOccurrence[] | undefined
  onDayClick: (day: Date) => void
  onEventClick: (occurrence: EventOccurrence) => void
}

const today = () => startOfDay(new Date())

export function MonthView({ days, cursorDate, occurrences, onDayClick, onEventClick }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)]">
        {RU_WEEKDAYS_SHORT.map((label) => (
          <div key={label} className="px-2 py-2 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((day) => {
          const dayOccurrences = (occurrences ?? []).filter(
            (occurrence) => occurrence.start < addDays(day, 1) && occurrence.end > day,
          )
          const isCurrentMonth = day.getMonth() === cursorDate.getMonth()
          const isToday = isSameDay(day, today())

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={[
                'flex flex-col items-stretch gap-1 border-b border-r border-[var(--color-border)] p-1 text-left align-top',
                isCurrentMonth ? '' : 'opacity-40',
              ].join(' ')}
            >
              <span
                className={[
                  'w-fit rounded-full px-1.5 py-0.5 text-xs',
                  isToday ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]' : '',
                ].join(' ')}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayOccurrences.slice(0, 3).map((occurrence) => (
                  <span
                    key={occurrence.occurrenceKey}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEventClick(occurrence)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.stopPropagation()
                        onEventClick(occurrence)
                      }
                    }}
                    style={{ backgroundColor: occurrence.event.color ?? '#1a73e8' }}
                    className="truncate rounded px-1 py-0.5 text-xs text-white"
                  >
                    {occurrence.event.title}
                  </span>
                ))}
                {dayOccurrences.length > 3 && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ещё {dayOccurrences.length - 3}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
