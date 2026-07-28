import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { useGameEventStore } from '@/store/gameEventStore'
import type { GamificationProfile, HabitEntity } from '@/data/entities'

export interface AchievementContext {
  profile: GamificationProfile
  habits: HabitEntity[]
}

export interface AchievementDef {
  id: string
  icon: string
  title: string
  description: string
  check: (ctx: AchievementContext) => boolean
}

const completionsCount = (ctx: AchievementContext) => ctx.profile.xpLog.length
const bestStreak = (ctx: AchievementContext) =>
  ctx.habits.reduce((max, habit) => Math.max(max, habit.bestStreak), 0)

/** Каталог достижений — все условия считаются из уже имеющихся данных, без новых счётчиков. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'level-5',
    icon: '🥉',
    title: '5 уровень',
    description: 'Достигни 5 уровня',
    check: (ctx) => ctx.profile.level >= 5,
  },
  {
    id: 'level-10',
    icon: '🥈',
    title: '10 уровень',
    description: 'Достигни 10 уровня',
    check: (ctx) => ctx.profile.level >= 10,
  },
  {
    id: 'level-20',
    icon: '🥇',
    title: '20 уровень',
    description: 'Достигни 20 уровня',
    check: (ctx) => ctx.profile.level >= 20,
  },
  {
    id: 'completions-1',
    icon: '🌱',
    title: 'Первый шаг',
    description: 'Выполни первую задачу или привычку',
    check: (ctx) => completionsCount(ctx) >= 1,
  },
  {
    id: 'completions-10',
    icon: '🚀',
    title: 'Набираем обороты',
    description: 'Выполни 10 задач или привычек',
    check: (ctx) => completionsCount(ctx) >= 10,
  },
  {
    id: 'completions-50',
    icon: '⚡',
    title: 'Мастер рутины',
    description: 'Выполни 50 задач или привычек',
    check: (ctx) => completionsCount(ctx) >= 50,
  },
  {
    id: 'streak-7',
    icon: '🔥',
    title: 'Неделя подряд',
    description: 'Держи стрик привычки 7 дней',
    check: (ctx) => bestStreak(ctx) >= 7,
  },
  {
    id: 'streak-30',
    icon: '🌟',
    title: 'Железная дисциплина',
    description: 'Держи стрик привычки 30 дней',
    check: (ctx) => bestStreak(ctx) >= 30,
  },
]

export function computeUnlockedIds(ctx: AchievementContext): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.check(ctx)).map(
    (achievement) => achievement.id,
  )
}

/**
 * Пересчитывает, какие достижения уже выполнены, сохраняет новые разблокировки и показывает
 * тост на каждую. Идемпотентно и безопасно вызывать многократно (после каждой награды, при
 * старте приложения) — реально что-то делает только при появлении новых id.
 */
export async function checkAndUnlockAchievements(ctx: AchievementContext): Promise<void> {
  const unlocked = computeUnlockedIds(ctx)
  const newIds = unlocked.filter((id) => !ctx.profile.achievements.includes(id))
  if (newIds.length === 0) return

  await gamificationRepository.update({
    achievements: [...ctx.profile.achievements, ...newIds],
  })

  for (const id of newIds) {
    const achievement = ACHIEVEMENTS.find((item) => item.id === id)
    if (achievement) {
      useGameEventStore
        .getState()
        .pushEvent('achievement', `${achievement.icon} ${achievement.title}`)
    }
  }
}
