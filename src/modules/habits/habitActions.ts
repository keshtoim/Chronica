import { habitsRepository } from '@/data/repositories/habitsRepository'
import { grantReward } from '@/modules/gamification/engine'
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
