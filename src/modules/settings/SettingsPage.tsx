import { useLiveQuery } from 'dexie-react-hooks'
import { appSettingsRepository } from '@/data/repositories/appSettingsRepository'
import { mediaRepository } from '@/data/repositories/mediaRepository'
import { PhotoPicker } from '@/media/PhotoPicker'
import type { AppSettings, BackgroundFilters, MediaRef } from '@/data/entities'

const FILTER_CONFIG: { key: keyof BackgroundFilters; label: string; min: number; max: number }[] = [
  { key: 'brightness', label: 'Яркость', min: 0, max: 200 },
  { key: 'contrast', label: 'Контраст', min: 0, max: 200 },
  { key: 'saturation', label: 'Насыщенность', min: 0, max: 200 },
  { key: 'grayscale', label: 'Чёрно-белый', min: 0, max: 100 },
  { key: 'sepia', label: 'Сепия', min: 0, max: 100 },
]

const DEFAULT_FILTERS: BackgroundFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
}

export function SettingsPage() {
  const settings = useLiveQuery(() => appSettingsRepository.get(), [])
  if (!settings) return null

  async function updateBackground(changes: Partial<AppSettings['background']>) {
    await appSettingsRepository.update({
      background: { ...settings!.background, ...changes },
    })
  }

  async function handlePhotoChange(ref: MediaRef | undefined) {
    const previous = settings!.background.imageRef
    await updateBackground({ imageRef: ref })
    if (previous && previous.blobKey !== ref?.blobKey) {
      await mediaRepository.remove(previous.blobKey)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-lg font-medium">Настройки внешнего вида</h1>

      <div className="rounded-xl border border-[var(--color-border)] p-4">
        <h2 className="mb-3 font-medium">Фон приложения</h2>

        <PhotoPicker
          value={settings.background.imageRef}
          aspect={16 / 9}
          onChange={(ref) => void handlePhotoChange(ref)}
          label="Фон"
          thumbnailClassName="h-16 w-28 rounded-md object-cover"
        />

        <div className="mt-4">
          <label className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>Размытие</span>
            <span>{settings.background.blur}px</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={settings.background.blur}
            onChange={(event) => void updateBackground({ blur: Number(event.target.value) })}
            className="w-full"
          />
        </div>

        {FILTER_CONFIG.map((filter) => (
          <div key={filter.key} className="mt-3">
            <label className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>{filter.label}</span>
              <span>{settings.background.filters[filter.key]}%</span>
            </label>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={settings.background.filters[filter.key]}
              onChange={(event) =>
                void updateBackground({
                  filters: {
                    ...settings.background.filters,
                    [filter.key]: Number(event.target.value),
                  },
                })
              }
              className="w-full"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => void updateBackground({ blur: 0, filters: DEFAULT_FILTERS })}
          className="mt-4 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface-hover)]"
        >
          Сбросить размытие и фильтры
        </button>
      </div>
    </div>
  )
}
