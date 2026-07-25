import { formatDayHeader, isSameDay } from '@/modules/calendar/dateUtils'
import type { EventOccurrence } from '@/modules/calendar/occurrences'
import { MediaImage } from '@/media/MediaImage'

interface Props {
  occurrences: EventOccurrence[] | undefined
  onEventClick: (occurrence: EventOccurrence) => void
}

function formatTimeRange(occurrence: EventOccurrence): string {
  if (occurrence.event.allDay) return 'Весь день'
  const format = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return `${format(occurrence.start)} – ${format(occurrence.end)}`
}

export function AgendaView({ occurrences, onEventClick }: Props) {
  if (!occurrences) return null

  if (occurrences.length === 0) {
    return (
      <p className="p-8 text-sm text-[var(--color-text-muted)]">
        Ближайших 30 дней без событий — самое время что-нибудь запланировать.
      </p>
    )
  }

  const groups: { day: Date; items: EventOccurrence[] }[] = []
  for (const occurrence of occurrences) {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && isSameDay(lastGroup.day, occurrence.start)) {
      lastGroup.items.push(occurrence)
    } else {
      groups.push({ day: occurrence.start, items: [occurrence] })
    }
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {groups.map((group) => (
        <div key={group.day.toISOString()} className="flex gap-4 px-4 py-3">
          <div className="w-32 shrink-0 pt-0.5 text-sm font-medium capitalize text-[var(--color-text-muted)]">
            {formatDayHeader(group.day)}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            {group.items.map((occurrence) => (
              <button
                key={occurrence.occurrenceKey}
                type="button"
                onClick={() => onEventClick(occurrence)}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-[var(--color-surface-hover)]"
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: occurrence.event.color ?? '#1a73e8' }}
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                />
                <span className="w-28 shrink-0 text-xs text-[var(--color-text-muted)]">
                  {formatTimeRange(occurrence)}
                </span>
                {occurrence.event.photo && (
                  <MediaImage
                    blobKey={occurrence.event.photo.blobKey}
                    alt=""
                    className="h-8 w-12 shrink-0 rounded object-cover"
                  />
                )}
                <span className="truncate">{occurrence.event.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
