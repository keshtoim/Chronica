import { computeCharacterStats } from '@/modules/gamification/characterClasses'
import type { CharacterClassId } from '@/data/entities'

const STAT_LABELS: {
  key: keyof ReturnType<typeof computeCharacterStats>
  label: string
  icon: string
}[] = [
  { key: 'str', label: 'Сила', icon: '💪' },
  { key: 'int', label: 'Интеллект', icon: '🧠' },
  { key: 'con', label: 'Выносливость', icon: '🛡️' },
  { key: 'per', label: 'Восприятие', icon: '👁️' },
]

interface Props {
  level: number
  characterClass: CharacterClassId
}

/** Пока чисто косметический показатель прогресса — переиспользуется в дашборде и при создании персонажа. */
export function CharacterStats({ level, characterClass }: Props) {
  const stats = computeCharacterStats(level, characterClass)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_LABELS.map((stat) => (
        <div
          key={stat.key}
          className="rounded-lg border border-[var(--color-border)] p-2 text-center"
        >
          <div className="text-lg" aria-hidden="true">
            {stat.icon}
          </div>
          <div className="text-lg font-medium">{stats[stat.key]}</div>
          <div className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
