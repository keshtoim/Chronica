import { onOpenUrl } from '@tauri-apps/plugin-deep-link'
import { openUrl } from '@tauri-apps/plugin-opener'
import {
  GOOGLE_OAUTH_CLIENT_IDS,
  GOOGLE_DRIVE_SCOPE,
  GOOGLE_MOBILE_REDIRECT_URI,
} from '@/sync/google/config'
import { generateCodeChallenge, generateCodeVerifier } from '@/sync/google/pkce'
import { exchangeCodeForTokens, refreshAccessToken } from '@/sync/google/tokenExchange'
import type { GoogleTokenProvider } from '@/sync/google/tokenProvider'

const REFRESH_TOKEN_STORAGE_KEY = 'chronica.google.mobile.refreshToken'
const EXPIRY_SAFETY_MARGIN_MS = 30_000
const CLIENT_ID = GOOGLE_OAUTH_CLIENT_IDS.android

let cachedAccessToken: { token: string; expiresAt: number } | null = null

/**
 * Android: Google Sign-In SDK тут не используется (это Tauri-webview, не нативный Android-код),
 * поэтому — браузер + PKCE + custom-scheme deep link обратно в приложение. Android-клиенты
 * в Google Cloud Console не получают client_secret — не требуется и здесь.
 */
async function runInteractiveFlow(): Promise<{
  accessToken: string
  expiresIn: number
  refreshToken: string
}> {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', GOOGLE_MOBILE_REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', GOOGLE_DRIVE_SCOPE)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  const code = await new Promise<string>((resolve, reject) => {
    onOpenUrl((urls) => {
      const redirected = urls.find((url) => url.startsWith(GOOGLE_MOBILE_REDIRECT_URI))
      if (!redirected) return
      try {
        const parsed = new URL(redirected)
        const authCode = parsed.searchParams.get('code')
        const error = parsed.searchParams.get('error')
        if (error) {
          reject(new Error(`Google отклонил авторизацию: ${error}`))
        } else if (!authCode) {
          reject(new Error('В redirect URL нет параметра code'))
        } else {
          resolve(authCode)
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Не удалось разобрать redirect URL'))
      }
    }).catch(reject)

    void openUrl(authUrl.toString()).catch(reject)
  })

  const tokens = await exchangeCodeForTokens({
    code,
    clientId: CLIENT_ID,
    redirectUri: GOOGLE_MOBILE_REDIRECT_URI,
    codeVerifier,
  })
  if (!tokens.refreshToken) {
    throw new Error('Google не вернул refresh token — попробуй отключить и подключить заново')
  }
  return {
    accessToken: tokens.accessToken,
    expiresIn: tokens.expiresIn,
    refreshToken: tokens.refreshToken,
  }
}

export const mobileGoogleTokenProvider: GoogleTokenProvider = {
  isConnected() {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) !== null
  },

  disconnect() {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    cachedAccessToken = null
  },

  async getAccessToken({ interactive = false }: { interactive?: boolean } = {}) {
    if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + EXPIRY_SAFETY_MARGIN_MS) {
      return cachedAccessToken.token
    }

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    if (storedRefreshToken) {
      try {
        const refreshed = await refreshAccessToken({
          refreshToken: storedRefreshToken,
          clientId: CLIENT_ID,
        })
        cachedAccessToken = {
          token: refreshed.accessToken,
          expiresAt: Date.now() + refreshed.expiresIn * 1000,
        }
        return refreshed.accessToken
      } catch {
        if (!interactive) throw new Error('Не удалось обновить токен Google — переподключись')
      }
    } else if (!interactive) {
      throw new Error('Нужна авторизация в Google Drive')
    }

    const result = await runInteractiveFlow()
    cachedAccessToken = {
      token: result.accessToken,
      expiresAt: Date.now() + result.expiresIn * 1000,
    }
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, result.refreshToken)
    return result.accessToken
  },
}
