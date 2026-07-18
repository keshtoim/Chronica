import { RRule } from 'rrule'
import type { EventEntity } from '@/data/entities'
import { toDateKey } from '@/modules/calendar/dateUtils'

export { toDateKey }

export interface EventOccurrence {
  event: EventEntity
  start: Date
  end: Date
  /** Является ли вхождением повторяющегося события (а не самим единичным событием). */
  isRecurring: boolean
  /** Уникальный ключ вхождения — React key и идентификатор для удаления одного вхождения (recurrenceExceptions). */
  occurrenceKey: string
}

/**
 * Разворачивает события (включая повторяющиеся по RRULE) во вхождения, пересекающие [rangeStart, rangeEnd).
 * Работает по всем событиям в памяти — приемлемо для личного календаря; при росте данных стоит
 * добавить индексацию по диапазону дат на уровне Dexie-запроса.
 */
export function expandOccurrences(
  events: EventEntity[],
  rangeStart: Date,
  rangeEnd: Date,
): EventOccurrence[] {
  const occurrences: EventOccurrence[] = []

  for (const event of events) {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const duration = eventEnd.getTime() - eventStart.getTime()

    if (!event.recurrenceRule) {
      if (eventStart < rangeEnd && eventEnd > rangeStart) {
        occurrences.push({
          event,
          start: eventStart,
          end: eventEnd,
          isRecurring: false,
          occurrenceKey: event.id,
        })
      }
      continue
    }

    try {
      const options = RRule.parseString(event.recurrenceRule)
      options.dtstart = eventStart
      const rule = new RRule(options)
      const exceptions = new Set(event.recurrenceExceptions ?? [])
      // Расширяем поиск назад на длительность события, чтобы не терять вхождения,
      // начавшиеся до rangeStart, но всё ещё пересекающие диапазон.
      const searchStart = new Date(rangeStart.getTime() - duration)
      const starts = rule.between(searchStart, rangeEnd, true)

      for (const occStart of starts) {
        if (exceptions.has(toDateKey(occStart))) continue
        const occEnd = new Date(occStart.getTime() + duration)
        if (occStart < rangeEnd && occEnd > rangeStart) {
          occurrences.push({
            event,
            start: occStart,
            end: occEnd,
            isRecurring: true,
            occurrenceKey: `${event.id}:${occStart.toISOString()}`,
          })
        }
      }
    } catch {
      // Некорректный RRULE у одного события не должен ронять весь календарь.
    }
  }

  return occurrences.sort((a, b) => a.start.getTime() - b.start.getTime())
}
