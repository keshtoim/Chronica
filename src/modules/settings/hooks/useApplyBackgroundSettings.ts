import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { appSettingsRepository } from '@/data/repositories/appSettingsRepository'
import { mediaRepository } from '@/data/repositories/mediaRepository'

/** Читает AppSettings.background и прописывает CSS-переменные --app-bg-image/--app-bg-filter на :root. */
export function useApplyBackgroundSettings(): void {
  const settings = useLiveQuery(() => appSettingsRepository.get(), [])

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    let objectUrl: string | undefined
    let cancelled = false

    async function apply() {
      const { background } = settings!

      if (background.imageRef) {
        const blob = await mediaRepository.get(background.imageRef.blobKey)
        if (!cancelled && blob) {
          objectUrl = URL.createObjectURL(blob)
          root.style.setProperty('--app-bg-image', `url(${objectUrl})`)
        }
      } else {
        root.style.setProperty('--app-bg-image', 'none')
      }

      const f = background.filters
      const filterChain = [
        background.blur > 0 ? `blur(${background.blur}px)` : '',
        `brightness(${f.brightness}%)`,
        `contrast(${f.contrast}%)`,
        `saturate(${f.saturation}%)`,
        `grayscale(${f.grayscale}%)`,
        `sepia(${f.sepia}%)`,
      ]
        .filter(Boolean)
        .join(' ')
      root.style.setProperty('--app-bg-filter', filterChain)
    }

    void apply()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [settings])
}
