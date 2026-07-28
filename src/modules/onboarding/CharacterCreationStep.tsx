import { useState } from 'react'
import { gamificationRepository } from '@/data/repositories/gamificationRepository'
import { PhotoPicker } from '@/media/PhotoPicker'
import { CLASS_LIST } from '@/modules/gamification/characterClasses'
import { CharacterStats } from '@/modules/gamification/components/CharacterStats'
import type { CharacterClassId, GamificationProfile, MediaRef } from '@/data/entities'

interface Props {
  profile: GamificationProfile
  onComplete: () => void
}

export function CharacterCreationStep({ profile, onComplete }: Props) {
  const [nickname, setNickname] = useState(profile.nickname)
  const [photo, setPhoto] = useState<MediaRef | undefined>(profile.photo)
  const [characterClass, setCharacterClass] = useState<CharacterClassId>(profile.characterClass)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('Придумай имя своему персонажу')
      return
    }
    await gamificationRepository.update({
      nickname: trimmed,
      photo,
      characterClass,
      onboardingComplete: true,
    })
    onComplete()
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium">Создай персонажа</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Имя, портрет и класс — характеристики будут расти вместе с уровнем.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Имя персонажа
        <input
          autoFocus
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Например, Тень Дедлайнов"
          className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none"
        />
      </label>

      <PhotoPicker
        value={photo}
        aspect={1}
        onChange={setPhoto}
        label="Портрет"
        thumbnailClassName="h-14 w-14 rounded-full object-cover"
      />

      <div>
        <p className="mb-2 text-sm">Класс</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CLASS_LIST.map((classDef) => (
            <button
              key={classDef.id}
              type="button"
              onClick={() => setCharacterClass(classDef.id)}
              className={[
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                characterClass === classDef.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-surface-hover)]'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]',
              ].join(' ')}
            >
              <span className="text-2xl" aria-hidden="true">
                {classDef.icon}
              </span>
              <span>
                <span className="block text-sm font-medium">{classDef.name}</span>
                <span className="block text-xs text-[var(--color-text-muted)]">
                  {classDef.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <CharacterStats level={profile.level} characterClass={characterClass} />

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-contrast)]"
      >
        Начать приключение
      </button>
    </div>
  )
}
