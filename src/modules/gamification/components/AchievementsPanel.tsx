import { ACHIEVEMENTS } from '@/modules/gamification/achievements'
import type { GamificationProfile, HabitEntity } from '@/data/entities'

interface Props {
  profile: GamificationProfile
  habits: HabitEntity[]
}

export function AchievementsPanel({ profile, habits }: Props) {
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-glass)] p-4 shadow-soft backdrop-blur-md">
      <h2 className="mb-3 font-semibold">Достижения</h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = profile.achievements.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={[
                'flex flex-col items-center gap-1 rounded-button border p-3 text-center transition-opacity',
                unlocked
                  ? 'border-[var(--color-border)]'
                  : 'border-[var(--color-border)] opacity-40',
              ].join(' ')}
            >
              <span className="text-2xl" aria-hidden="true">
                {achievement.icon}
              </span>
              <span className="text-xs font-medium">{achievement.title}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {unlocked ? achievement.description : `🔒 ${achievement.description}`}
              </span>
            </div>
          )
        })}
      </div>

      {habits.length === 0 && (
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Стрик-достижения появятся, как только заведёшь первую привычку.
        </p>
      )}
    </div>
  )
}
