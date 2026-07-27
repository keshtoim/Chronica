import { GOOGLE_OAUTH_CLIENT_IDS, GOOGLE_DRIVE_SCOPE } from '@/sync/google/config'
import type { GoogleTokenProvider } from '@/sync/google/tokenProvider'

const STORAGE_KEY = 'chronica.google.connected'
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
/** Обновляем токен чуть раньше формального истечения — запас на время сетевого запроса. */
const EXPIRY_SAFETY_MARGIN_MS = 30_000

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
            error_callback?: (error: unknown) => void
          }) => TokenClient
        }
      }
    }
  }
}

let scriptLoadPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Не удалось загрузить Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Web-реализация: Google Identity Services (GIS) token client. Первое подключение требует
 * клика пользователя (interactive: true) — браузеры блокируют всплывающее окно авторизации
 * вне пользовательского жеста. После согласия GIS может тихо переобновлять токен в рамках
 * той же вкладки; при недоступности тихого обновления — нужно снова нажать "Подключить".
 */
export const webGoogleTokenProvider: GoogleTokenProvider = {
  isConnected() {
    return localStorage.getItem(STORAGE_KEY) === '1'
  },

  disconnect() {
    localStorage.removeItem(STORAGE_KEY)
    cachedToken = null
  },

  async getAccessToken({ interactive = false }: { interactive?: boolean } = {}) {
    if (cachedToken && cachedToken.expiresAt > Date.now() + EXPIRY_SAFETY_MARGIN_MS) {
      return cachedToken.token
    }

    await loadGisScript()

    return new Promise<string>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CLIENT_IDS.web,
        scope: GOOGLE_DRIVE_SCOPE,
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error ?? 'Не удалось получить токен Google'))
            return
          }
          cachedToken = {
            token: response.access_token,
            expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
          }
          localStorage.setItem(STORAGE_KEY, '1')
          resolve(response.access_token)
        },
        error_callback: (error) => {
          reject(error instanceof Error ? error : new Error('Не удалось авторизоваться в Google'))
        },
      })
      client.requestAccessToken({ prompt: interactive ? 'consent' : '' })
    })
  },
}
