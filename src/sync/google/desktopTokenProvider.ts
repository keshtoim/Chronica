import {
  start as startOauthServer,
  cancel as cancelOauthServer,
  onUrl,
} from '@fabianlars/tauri-plugin-oauth'
import { openUrl } from '@tauri-apps/plugin-opener'
import { GOOGLE_OAUTH_CLIENT_IDS, GOOGLE_DRIVE_SCOPE } from '@/sync/google/config'
import { generateCodeChallenge, generateCodeVerifier } from '@/sync/google/pkce'
import { exchangeCodeForTokens, refreshAccessToken } from '@/sync/google/tokenExchange'
import type { GoogleTokenProvider } from '@/sync/google/tokenProvider'

const REFRESH_TOKEN_STORAGE_KEY = 'chronica.google.desktop.refreshToken'
const EXPIRY_SAFETY_MARGIN_MS = 30_000
const CLIENT_ID = GOOGLE_OAUTH_CLIENT_IDS.desktop
// Не по-настоящему секретен для installed-приложений, но Google требует его в token exchange —
// хранится вне репозитория, см. .env.example.
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_DESKTOP_CLIENT_SECRET as string | undefined

let cachedAccessToken: { token: string; expiresAt: number } | null = null

/**
 * Полный интерактивный поток: локальный loopback-сервер (tauri-plugin-oauth) принимает
 * Google redirect, системный браузер (tauri-plugin-opener) показывает экран согласия —
 * embedded webview Google для OAuth не разрешает ("disallowed_useragent").
 */
async function runInteractiveFlow(): Promise<{
  accessToken: string
  expiresIn: number
  refreshToken: string
}> {
  const port = await startOauthServer()
  const redirectUri = `http://localhost:${port}`
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', GOOGLE_DRIVE_SCOPE)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  let code: string
  try {
    code = await new Promise<string>((resolve, reject) => {
      onUrl((redirectedUrl) => {
        try {
          const parsed = new URL(redirectedUrl)
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
  } finally {
    await cancelOauthServer(port).catch(() => undefined)
  }

  const tokens = await exchangeCodeForTokens({
    code,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri,
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

export const desktopGoogleTokenProvider: GoogleTokenProvider = {
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
          clientSecret: CLIENT_SECRET,
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
