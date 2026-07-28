import { habitsRepository } from '@/data/repositories/habitsRepository'
import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { grantReward } from '@/modules/gamification/engine'
import { checkAndUnlockAchievements } from '@/modules/gamification/achievements'
import { computeStreaks } from '@/modules/habits/streaks'
import { toDateKey } from '@/modules/calendar/dateUtils'
import type { HabitEntity } from '@/data/entities'

/** Переключает отметку о выполнении привычки на дату (по умолчанию — сегодня) и пересчитывает стрики. */
export async function toggleHabitCompletion(
  habit: HabitEntity,
  date: Date = new Date(),
): Promise<void> {
  const key = toDateKey(date)
  const alreadyDone = habit.completions.some((entry) => entry.date === key && entry.count > 0)

  const completions = alreadyDone
    ? habit.completions.filter((entry) => entry.date !== key)
    : [...habit.completions.filter((entry) => entry.date !== key), { date: key, count: 1 }]

  const { current, best } = computeStreaks({ ...habit, completions })
  await habitsRepository.update(habit.id, {
    completions,
    currentStreak: current,
    bestStreak: best,
  })

  if (!alreadyDone) await grantReward('habit', habit.id)
}

/** Закрывает день привычки свитком пропуска (куплен у торговца) — не даёт наград, но не рвёт стрик. */
export async function skipHabitDay(habit: HabitEntity, date: Date = new Date()): Promise<void> {
  const key = toDateKey(date)
  const existing = habit.skippedDates ?? []
  if (existing.includes(key)) return

  const skippedDates = [...existing, key]
  const { current, best } = computeStreaks({ ...habit, skippedDates })
  await habitsRepository.update(habit.id, {
    skippedDates,
    currentStreak: current,
    bestStreak: best,
  })

  const [profile, habits] = await Promise.all([
    gamificationRepository.get(),
    habitsRepository.list(),
  ])
  await checkAndUnlockAchievements({ profile, habits })
}
