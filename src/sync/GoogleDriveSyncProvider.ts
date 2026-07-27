import type { SyncProvider, SyncSnapshot } from '@/sync/SyncProvider'
import type { GoogleTokenProvider } from '@/sync/google/tokenProvider'
import { downloadSyncFile, uploadSyncFile } from '@/sync/google/driveApi'

/**
 * Синхронизация через резервную копию в скрытой appDataFolder на Google Drive пользователя.
 * Получение access token делегировано GoogleTokenProvider — конкретная реализация (web/desktop/
 * mobile) зависит от платформы, сам провайдер синхронизации от этого не зависит.
 */
export class GoogleDriveSyncProvider implements SyncProvider {
  readonly id = 'google-drive'
  private readonly tokenProvider: GoogleTokenProvider

  constructor(tokenProvider: GoogleTokenProvider) {
    this.tokenProvider = tokenProvider
  }

  async pull(): Promise<SyncSnapshot | null> {
    const token = await this.tokenProvider.getAccessToken()
    const content = await downloadSyncFile(token)
    if (!content) return null
    return JSON.parse(content) as SyncSnapshot
  }

  async push(snapshot: SyncSnapshot): Promise<void> {
    const token = await this.tokenProvider.getAccessToken()
    await uploadSyncFile(token, JSON.stringify(snapshot))
  }
}
