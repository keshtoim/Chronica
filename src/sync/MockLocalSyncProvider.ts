import Dexie, { type EntityTable } from 'dexie'
import type { SyncProvider, SyncSnapshot } from '@/sync/SyncProvider'

const REMOTE_SNAPSHOT_ID = 'remote'
/** Имитирует задержку сети реального Google Drive API. */
const SIMULATED_LATENCY_MS = 400

class MockRemoteDB extends Dexie {
  snapshots!: EntityTable<{ id: string; snapshot: SyncSnapshot }, 'id'>

  constructor() {
    // Отдельная база данных имитирует "облако" — физически изолирована от локальных данных приложения.
    super('chronica-mock-remote')
    this.version(1).stores({ snapshots: 'id' })
  }
}

const remoteDb = new MockRemoteDB()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Заглушка синхронизации на время, пока не настроен Google OAuth Client ID.
 * Будет заменена на GoogleDriveSyncProvider с тем же интерфейсом SyncProvider.
 */
export class MockLocalSyncProvider implements SyncProvider {
  readonly id = 'mock-local'

  async pull(): Promise<SyncSnapshot | null> {
    await delay(SIMULATED_LATENCY_MS)
    const record = await remoteDb.snapshots.get(REMOTE_SNAPSHOT_ID)
    return record?.snapshot ?? null
  }

  async push(snapshot: SyncSnapshot): Promise<void> {
    await delay(SIMULATED_LATENCY_MS)
    await remoteDb.snapshots.put({ id: REMOTE_SNAPSHOT_ID, snapshot })
  }
}
