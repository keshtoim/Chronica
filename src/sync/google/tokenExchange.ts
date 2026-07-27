/**
 * Обмен authorization code / refresh token на access token через Google OAuth token endpoint.
 * Общий код для desktop и mobile (оба используют PKCE + loopback/deep-link redirect,
 * различается только способ получения authorization code).
 */
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export interface TokenExchangeResult {
  accessToken: string
  expiresIn: number
  refreshToken?: string
}

async function postForm(params: URLSearchParams): Promise<TokenExchangeResult> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Google token endpoint ${response.status}: ${body || response.statusText}`)
  }
  const data = (await response.json()) as {
    access_token: string
    expires_in: number
    refresh_token?: string
  }
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
  }
}

export async function exchangeCodeForTokens(options: {
  code: string
  clientId: string
  clientSecret?: string
  redirectUri: string
  codeVerifier: string
}): Promise<TokenExchangeResult> {
  const params = new URLSearchParams({
    code: options.code,
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: options.codeVerifier,
  })
  if (options.clientSecret) params.set('client_secret', options.clientSecret)
  return postForm(params)
}

export async function refreshAccessToken(options: {
  refreshToken: string
  clientId: string
  clientSecret?: string
}): Promise<TokenExchangeResult> {
  const params = new URLSearchParams({
    refresh_token: options.refreshToken,
    client_id: options.clientId,
    grant_type: 'refresh_token',
  })
  if (options.clientSecret) params.set('client_secret', options.clientSecret)
  return postForm(params)
}
