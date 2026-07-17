export interface SyncSnapshot {
  version: number
  updatedAt: string
  data: Record<string, unknown[]>
}

/**
 * Единый интерфейс для механизма синхронизации. MockLocalSyncProvider реализует его
 * поверх второй локальной IndexedDB-базы; позже GoogleDriveSyncProvider реализует его
 * поверх Drive appDataFolder — вызывающий код (SyncEngine) не меняется.
 */
export interface SyncProvider {
  readonly id: string
  pull(): Promise<SyncSnapshot | null>
  push(snapshot: SyncSnapshot): Promise<void>
}
