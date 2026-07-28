import { appSettingsRepository } from '@/data/repositories/appSettingsRepository'
import { habitsRepository } from '@/data/repositories/habitsRepository'
import { applyMissedDailyPenalty } from '@/modules/gamification/engine'
import { addDays, startOfDay, toDateKey } from '@/modules/calendar/dateUtils'

/**
 * Раз в день (при первом запуске приложения в новый день) проверяет daily-привычки на пропуск
 * вчерашнего дня и начисляет штраф HP. Проверяется только один предыдущий день — если
 * приложение не открывали несколько дней подряд, штраф всё равно начислится максимум один раз
 * за самый последний пропущенный день (упрощение, чтобы не наказывать резко за долгий перерыв).
 */
export async function runDailyPenaltyCheck(): Promise<void> {
  const settings = await appSettingsRepository.get()
  const todayKey = toDateKey(new Date())
  if (settings.lastPenaltyCheckDate === todayKey) return

  const yesterday = addDays(startOfDay(new Date()), -1)
  const yesterdayKey = toDateKey(yesterday)
  const habits = await habitsRepository.list()

  let missedCount = 0
  for (const habit of habits) {
    if (habit.frequency.type !== 'daily') continue
    if (new Date(habit.createdAt) >= yesterday) continue // привычка ещё не существовала вчера
    const done = habit.completions.some((entry) => entry.date === yesterdayKey && entry.count > 0)
    const skipped = (habit.skippedDates ?? []).includes(yesterdayKey)
    if (!done && !skipped) missedCount += 1
  }

  await applyMissedDailyPenalty(missedCount)
  await appSettingsRepository.update({ lastPenaltyCheckDate: todayKey })
}
