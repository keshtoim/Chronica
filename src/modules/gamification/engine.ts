import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { useGameEventStore } from '@/store/gameEventStore'
import type { XpSourceType } from '@/data/entities'

const XP_PER_COMPLETION = 10
const GOLD_PER_COMPLETION = 5
const HP_PENALTY_PER_MISSED_DAILY = 10

/** XP, нужный для перехода с уровня level на level + 1 (простая линейная прогрессия). */
export function xpToNextLevel(level: number): number {
  return level * 100
}

/**
 * Начисляет XP поверх текущего прогресса и обрабатывает переход на следующий уровень —
 * в цикле, на случай если разом начислили больше XP, чем нужно для нескольких уровней подряд.
 * Вынесена отдельно от grantReward как чистая функция — легко тестируется без БД.
 */
export function applyXpGain(
  currentXp: number,
  currentLevel: number,
  gained: number,
): { xp: number; level: number } {
  let xp = currentXp + gained
  let level = currentLevel
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level)
    level += 1
  }
  return { xp, level }
}

/**
 * Начисляет XP и золото за выполнение задачи/привычки.
 */
export async function grantReward(sourceType: XpSourceType, sourceId: string): Promise<void> {
  const profile = await gamificationRepository.get()
  const { xp, level } = applyXpGain(profile.xp, profile.level, XP_PER_COMPLETION)

  await gamificationRepository.update({
    xp,
    level,
    gold: profile.gold + GOLD_PER_COMPLETION,
    xpLog: [
      ...profile.xpLog,
      { sourceId, sourceType, amount: XP_PER_COMPLETION, date: new Date().toISOString() },
    ],
  })

  useGameEventStore
    .getState()
    .pushEvent('reward', `+${XP_PER_COMPLETION} XP · +${GOLD_PER_COMPLETION} 💰`)
  if (level > profile.level) {
    useGameEventStore.getState().pushEvent('levelup', `Новый уровень: ${level}! 🎉`)
  }
}

/** Урон по HP за один пропущенный daily — используется при ежедневной проверке пропусков. */
export async function applyMissedDailyPenalty(missedCount: number): Promise<void> {
  if (missedCount <= 0) return
  const profile = await gamificationRepository.get()
  const damage = missedCount * HP_PENALTY_PER_MISSED_DAILY
  await gamificationRepository.update({ hp: Math.max(0, profile.hp - damage) })
  useGameEventStore.getState().pushEvent('damage', `-${damage} HP · пропущена ежедневная привычка`)
}

export async function purchaseReward(rewardId: string): Promise<{ ok: boolean; reason?: string }> {
  const profile = await gamificationRepository.get()
  const reward = profile.rewards.find((item) => item.id === rewardId)
  if (!reward) return { ok: false, reason: 'Награда не найдена' }
  if (profile.gold < reward.cost) return { ok: false, reason: 'Недостаточно золота' }
  await gamificationRepository.update({ gold: profile.gold - reward.cost })
  return { ok: true }
}
