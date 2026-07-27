export interface GetAccessTokenOptions {
  /** Разрешить показать окно входа/согласия Google. Без этого — только тихая попытка. */
  interactive?: boolean
}

/**
 * Абстракция получения access token для Google Drive API — у web/desktop/mobile разные
 * OAuth-потоки (GIS в браузере vs loopback-редирект в системный браузер vs deep link),
 * но GoogleDriveSyncProvider работает с любой реализацией одинаково.
 */
export interface GoogleTokenProvider {
  getAccessToken(options?: GetAccessTokenOptions): Promise<string>
  isConnected(): boolean
  disconnect(): void
}
