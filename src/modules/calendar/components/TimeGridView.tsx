import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { eventsRepository } from '@/data/repositories/eventsRepository'
import { addDays, formatDayHeader, isSameDay, startOfDay } from '@/modules/calendar/dateUtils'
import type { EventOccurrence } from '@/modules/calendar/occurrences'

const HOUR_HEIGHT = 48
const SNAP_MINUTES = 15

interface Props {
  days: Date[]
  occurrences: EventOccurrence[] | undefined
  onSlotClick: (start: Date, end: Date) => void
  onEventClick: (occurrence: EventOccurrence) => void
}

interface DragState {
  occurrenceKey: string
  eventId: string
  mode: 'move' | 'resize'
  originStart: Date
  originEnd: Date
  startY: number
  deltaMinutes: number
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

function snapMinutes(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES
}

export function TimeGridView({ days, occurrences, onSlotClick, onEventClick }: Props) {
  const [drag, setDrag] = useState<DragState | null>(null)

  const allDayOccurrences = (occurrences ?? []).filter((occurrence) => occurrence.event.allDay)
  const timedOccurrences = (occurrences ?? []).filter((occurrence) => !occurrence.event.allDay)

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    occurrence: EventOccurrence,
    mode: 'move' | 'resize',
  ) {
    event.stopPropagation()
    setDrag({
      occurrenceKey: occurrence.occurrenceKey,
      eventId: occurrence.event.id,
      mode,
      originStart: occurrence.start,
      originEnd: occurrence.end,
      startY: event.clientY,
      deltaMinutes: 0,
    })
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return
    const deltaPx = event.clientY - drag.startY
    const deltaMinutes = snapMinutes((deltaPx / HOUR_HEIGHT) * 60)
    if (deltaMinutes !== drag.deltaMinutes) setDrag({ ...drag, deltaMinutes })
  }

  async function handlePointerUp() {
    if (!drag) return
    const { eventId, mode, originStart, originEnd, deltaMinutes } = drag
    setDrag(null)
    if (deltaMinutes === 0) return

    if (mode === 'move') {
      const newStart = new Date(originStart.getTime() + deltaMinutes * 60000)
      const newEnd = new Date(originEnd.getTime() + deltaMinutes * 60000)
      await eventsRepository.update(eventId, {
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
      })
    } else {
      const newEnd = new Date(originEnd.getTime() + deltaMinutes * 60000)
      if (newEnd.getTime() - originStart.getTime() < SNAP_MINUTES * 60000) return
      await eventsRepository.update(eventId, { end: newEnd.toISOString() })
    }
  }

  return (
    <div
      className="flex h-full flex-col"
      onPointerMove={handlePointerMove}
      onPointerUp={() => void handlePointerUp()}
      onPointerLeave={() => void handlePointerUp()}
    >
      <div className="flex border-b border-[var(--color-border)]">
        <div className="w-14 shrink-0" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex-1 border-l border-[var(--color-border)] p-2 text-center text-sm"
          >
            {formatDayHeader(day)}
          </div>
        ))}
      </div>

      {allDayOccurrences.length > 0 && (
        <div className="flex border-b border-[var(--color-border)]">
          <div className="w-14 shrink-0 py-1 pr-1 text-right text-[10px] text-[var(--color-text-muted)]">
            Весь день
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="flex flex-1 flex-col gap-0.5 border-l border-[var(--color-border)] p-1"
            >
              {allDayOccurrences
                .filter((occurrence) => occurrence.start < addDays(day, 1) && occurrence.end > day)
                .map((occurrence) => (
                  <button
                    key={occurrence.occurrenceKey}
                    type="button"
                    onClick={() => onEventClick(occurrence)}
                    style={{ backgroundColor: occurrence.event.color ?? '#1a73e8' }}
                    className="truncate rounded px-1 text-left text-xs text-white"
                  >
                    {occurrence.event.title}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}

      <div className="relative flex flex-1 overflow-y-auto">
        <div className="w-14 shrink-0">
          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={hour}
              style={{ height: HOUR_HEIGHT }}
              className="border-t border-[var(--color-border)] pr-1 text-right text-[10px] text-[var(--color-text-muted)]"
            >
              {hour}:00
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayStart = startOfDay(day)
          const isToday = isSameDay(day, new Date())
          const dayOccurrences = timedOccurrences.filter((occurrence) =>
            isSameDay(occurrence.start, day),
          )

          return (
            <div
              key={day.toISOString()}
              className="relative flex-1 border-l border-[var(--color-border)]"
            >
              {Array.from({ length: 24 }, (_, hour) => (
                <button
                  key={hour}
                  type="button"
                  style={{ height: HOUR_HEIGHT }}
                  className="block w-full border-t border-[var(--color-border)]"
                  onClick={() => {
                    const start = new Date(dayStart)
                    start.setHours(hour)
                    const end = new Date(start)
                    end.setHours(hour + 1)
                    onSlotClick(start, end)
                  }}
                />
              ))}

              {isToday && <CurrentTimeLine />}

              {dayOccurrences.map((occurrence) => {
                const isDragging = drag?.occurrenceKey === occurrence.occurrenceKey
                const start =
                  isDragging && drag.mode === 'move'
                    ? new Date(occurrence.start.getTime() + drag.deltaMinutes * 60000)
                    : occurrence.start
                const end = isDragging
                  ? new Date(occurrence.end.getTime() + drag.deltaMinutes * 60000)
                  : occurrence.end
                const top = (minutesSinceMidnight(start) / 60) * HOUR_HEIGHT
                const height = Math.max(
                  ((end.getTime() - start.getTime()) / 60000 / 60) * HOUR_HEIGHT,
                  18,
                )

                return (
                  <div
                    key={occurrence.occurrenceKey}
                    onPointerDown={(event) => handlePointerDown(event, occurrence, 'move')}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!isDragging) onEventClick(occurrence)
                    }}
                    style={{ top, height, backgroundColor: occurrence.event.color ?? '#1a73e8' }}
                    className="absolute inset-x-0.5 z-10 cursor-grab overflow-hidden rounded px-1 text-xs text-white"
                  >
                    {occurrence.event.title}
                    <div
                      onPointerDown={(event) => handlePointerDown(event, occurrence, 'resize')}
                      className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CurrentTimeLine() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(id)
  }, [])

  const top = (minutesSinceMidnight(now) / 60) * HOUR_HEIGHT
  return <div style={{ top }} className="absolute inset-x-0 z-20 h-px bg-[var(--color-danger)]" />
}
