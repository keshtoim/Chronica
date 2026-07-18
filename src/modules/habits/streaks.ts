import { addDays, startOfDay, toDateKey } from '@/modules/calendar/dateUtils'
import type { HabitEntity, HabitFrequency } from '@/data/entities'

/**
 * "due"-день — день, когда привычку нужно выполнить. daily и weekly трактуются одинаково
 * (каждый день) — точный учёт "N раз в неделю" для weekly добавил бы отдельный трекер
 * периода и выходит за рамки MVP; custom учитывает выбранные дни недели.
 */
function isDueOn(frequency: HabitFrequency, date: Date): boolean {
  if (frequency.type === 'custom') return (frequency.daysOfWeek ?? []).includes(date.getDay())
  return true
}

export interface StreakResult {
  current: number
  best: number
}

/**
 * Текущий стрик — идём назад от сегодня по due-дням. Сегодняшний due-день без отметки
 * не обрывает стрик (день ещё не закончился), но пропущенный день из прошлого — обрывает.
 * Лучший стрик — самая длинная последовательность подряд отмеченных due-дней за последние ~2 года.
 */
export function computeStreaks(habit: HabitEntity, referenceDate = new Date()): StreakResult {
  const doneDates = new Set(
    habit.completions.filter((entry) => entry.count > 0).map((entry) => entry.date),
  )
  const today = startOfDay(referenceDate)

  let current = 0
  let cursor = today
  let isFirstDueDay = true
  for (let step = 0; step < 3650; step += 1) {
    if (isDueOn(habit.frequency, cursor)) {
      const done = doneDates.has(toDateKey(cursor))
      if (done) {
        current += 1
      } else if (isFirstDueDay) {
        // сегодня ещё можно успеть выполнить — не засчитываем, но и не обрываем
      } else {
        break
      }
      isFirstDueDay = false
    }
    cursor = addDays(cursor, -1)
  }

  let best = 0
  let running = 0
  let scanCursor = addDays(today, -730)
  for (let step = 0; step < 730; step += 1) {
    if (isDueOn(habit.frequency, scanCursor)) {
      if (doneDates.has(toDateKey(scanCursor))) {
        running += 1
        best = Math.max(best, running)
      } else {
        running = 0
      }
    }
    scanCursor = addDays(scanCursor, 1)
  }

  return { current, best: Math.max(best, current) }
}
