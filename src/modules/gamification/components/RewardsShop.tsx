import { useState, type FormEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { purchaseReward } from '@/modules/gamification/engine'
import type { GamificationProfile } from '@/data/entities'

interface Props {
  profile: GamificationProfile
}

export function RewardsShop({ profile }: Props) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState(50)
  const [error, setError] = useState<string | null>(null)

  async function handleAddReward(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || cost <= 0) return
    await gamificationRepository.update({
      rewards: [...profile.rewards, { id: uuidv4(), name: trimmed, cost }],
    })
    setName('')
    setCost(50)
  }

  async function handleRemoveReward(rewardId: string) {
    await gamificationRepository.update({
      rewards: profile.rewards.filter((reward) => reward.id !== rewardId),
    })
  }

  async function handlePurchase(rewardId: string) {
    setError(null)
    const result = await purchaseReward(rewardId)
    if (!result.ok) setError(result.reason ?? 'Не удалось купить награду')
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <h2 className="mb-3 font-medium">Магазин наград</h2>

      {profile.rewards.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Пока нет наград — добавьте что-то, чем хотите себя порадовать за золото.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {profile.rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--color-border)] px-3 py-2"
            >
              <span className="text-sm">{reward.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">💰 {reward.cost}</span>
                <button
                  type="button"
                  onClick={() => void handlePurchase(reward.id)}
                  disabled={profile.gold < reward.cost}
                  className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-[var(--color-accent-contrast)] disabled:opacity-40"
                >
                  Купить
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveReward(reward.id)}
                  className="text-xs text-[var(--color-danger)] hover:underline"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}

      <form onSubmit={handleAddReward} className="mt-3 flex items-center gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Название награды"
          className="flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm outline-none"
        />
        <input
          type="number"
          min={1}
          value={cost}
          onChange={(event) => setCost(Number(event.target.value))}
          className="w-20 rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
        >
          Добавить
        </button>
      </form>
    </div>
  )
}
