export type RuntimePlatform = 'web' | 'tauri-desktop' | 'tauri-mobile'

/** Определяет, где сейчас исполняется код: обычный браузер, десктоп-Tauri или мобильный Tauri. */
export function detectPlatform(): RuntimePlatform {
  const globalWindow = window as unknown as {
    __TAURI_INTERNALS__?: unknown
    __TAURI__?: unknown
  }
  const isTauri = Boolean(globalWindow.__TAURI_INTERNALS__ ?? globalWindow.__TAURI__)
  if (!isTauri) return 'web'
  return /Android/i.test(navigator.userAgent) ? 'tauri-mobile' : 'tauri-desktop'
}
