import { useState } from 'react'
import { useGamificationProfile } from '@/modules/gamification/hooks/useGamificationProfile'
import { CharacterCreationStep } from '@/modules/onboarding/CharacterCreationStep'

interface ExplainerStep {
  icon: string
  title: string
  body: string
}

const EXPLAINER_STEPS: ExplainerStep[] = [
  {
    icon: '🎉',
    title: 'Добро пожаловать в Chronica',
    body: 'Календарь, задачи и привычки в одном приложении — с игровыми элементами, которые превращают рутину в приключение. Данные хранятся у тебя на устройстве и синхронизируются через твой личный Google Drive.',
  },
  {
    icon: '📅',
    title: 'Календарь',
    body: 'Месяц, неделя, день и повестка дня — как в привычных календарях. Повторяющиеся события, перетаскивание мышью, своё фото для любого события.',
  },
  {
    icon: '✅',
    title: 'Задачи',
    body: 'Списки с подзадачами, сортировка по своему порядку, по дате создания или по сроку. Выполненные задачи приносят опыт и золото.',
  },
  {
    icon: '🔥',
    title: 'Привычки',
    body: 'Ежедневные, еженедельные или по выбранным дням — со стриками и историей выполнения. Пропущенная ежедневная привычка отнимает HP у персонажа.',
  },
  {
    icon: '🧙',
    title: 'Персонаж и награды',
    body: 'За выполненные задачи и привычки персонаж растёт: опыт, уровень, золото. Золото можно тратить в собственном магазине наград — придумай, чем себя порадовать.',
  },
]

const TOTAL_STEPS = EXPLAINER_STEPS.length + 1 // + шаг создания персонажа

export function OnboardingFlow() {
  const profile = useGamificationProfile()
  const [stepIndex, setStepIndex] = useState(0)

  if (!profile) return null

  const isCharacterStep = stepIndex >= EXPLAINER_STEPS.length
  const explainer = EXPLAINER_STEPS[stepIndex]

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-4 [padding-top:max(1rem,env(safe-area-inset-top))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-card-lg border border-[var(--color-border)] bg-[var(--color-glass)] p-6 shadow-elevated backdrop-blur-md">
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span
              key={index}
              className={[
                'h-1.5 w-6 rounded-full transition-colors',
                index === stepIndex
                  ? 'bg-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-hover)]',
              ].join(' ')}
            />
          ))}
        </div>

        {isCharacterStep ? (
          <CharacterCreationStep profile={profile} onComplete={() => setStepIndex(0)} />
        ) : (
          <div className="flex flex-col gap-3 text-center">
            <span className="text-5xl" aria-hidden="true">
              {explainer.icon}
            </span>
            <h2 className="text-lg font-medium">{explainer.title}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">{explainer.body}</p>
          </div>
        )}

        {!isCharacterStep && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              disabled={stepIndex === 0}
              className="rounded-full px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)] disabled:opacity-0"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => setStepIndex((index) => index + 1)}
              className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent-contrast)]"
            >
              Далее
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
