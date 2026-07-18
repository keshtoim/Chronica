import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { eventsRepository } from '@/data/repositories/eventsRepository'
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
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const [occurrenceKey, sourceDayIso] = String(active.id).split('::')
    const occurrence = (occurrences ?? []).find((item) => item.occurrenceKey === occurrenceKey)
    if (!occurrence || occurrence.isRecurring) return

    const sourceDay = startOfDay(new Date(sourceDayIso))
    const targetDay = startOfDay(new Date(String(over.id)))
    const deltaDays = Math.round((targetDay.getTime() - sourceDay.getTime()) / 86_400_000)
    if (deltaDays === 0) return

    const newStart = addDays(new Date(occurrence.event.start), deltaDays)
    const newEnd = addDays(new Date(occurrence.event.end), deltaDays)
    await eventsRepository.update(occurrence.event.id, {
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    })
  }

  return (
    <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
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
            return (
              <MonthDayCell
                key={day.toISOString()}
                day={day}
                isCurrentMonth={day.getMonth() === cursorDate.getMonth()}
                isToday={isSameDay(day, today())}
                occurrences={dayOccurrences}
                onDayClick={onDayClick}
                onEventClick={onEventClick}
              />
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}

interface DayCellProps {
  day: Date
  isCurrentMonth: boolean
  isToday: boolean
  occurrences: EventOccurrence[]
  onDayClick: (day: Date) => void
  onEventClick: (occurrence: EventOccurrence) => void
}

function MonthDayCell({
  day,
  isCurrentMonth,
  isToday,
  occurrences,
  onDayClick,
  onEventClick,
}: DayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.toISOString() })

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayClick(day)}
      className={[
        'flex cursor-pointer flex-col items-stretch gap-1 border-b border-r border-[var(--color-border)] p-1 text-left align-top',
        isCurrentMonth ? '' : 'opacity-40',
        isOver ? 'bg-[var(--color-surface-hover)]' : '',
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
        {occurrences.slice(0, 3).map((occurrence) => (
          <MonthEventChip
            key={occurrence.occurrenceKey}
            occurrence={occurrence}
            day={day}
            onClick={() => onEventClick(occurrence)}
          />
        ))}
        {occurrences.length > 3 && (
          <span className="text-xs text-[var(--color-text-muted)]">
            ещё {occurrences.length - 3}
          </span>
        )}
      </div>
    </div>
  )
}

function MonthEventChip({
  occurrence,
  day,
  onClick,
}: {
  occurrence: EventOccurrence
  day: Date
  onClick: () => void
}) {
  // Повторяющиеся вхождения нельзя перетаскивать в Month view (перемещение затронуло бы
  // всю серию) — редактирование даты доступно через модалку.
  const draggable = !occurrence.isRecurring
  const draggableId = `${occurrence.occurrenceKey}::${day.toISOString()}`
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    disabled: !draggable,
  })

  return (
    <span
      ref={setNodeRef}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      style={{
        backgroundColor: occurrence.event.color ?? '#1a73e8',
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      className={[
        'truncate rounded px-1 py-0.5 text-xs text-white',
        draggable ? 'cursor-grab' : '',
        isDragging ? 'relative z-50 opacity-70' : '',
      ].join(' ')}
    >
      {occurrence.event.title}
    </span>
  )
}
