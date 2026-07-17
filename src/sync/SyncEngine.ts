import type { EntityTable } from 'dexie'
import { db, ensureSingletons } from '@/data/db'
import type { BaseEntity } from '@/data/entities'
import type { SyncProvider, SyncSnapshot } from '@/sync/SyncProvider'

const SNAPSHOT_VERSION = 1

const SYNCED_TABLES = [
  'events',
  'tasks',
  'taskLists',
  'habits',
  'gamificationProfile',
  'appSettings',
] as const
type SyncedTable = (typeof SYNCED_TABLES)[number]

// Синхронизируемые таблицы разнотипны (Event/Task/Habit/...), поэтому здесь используется
// единая сигнатура EntityTable<BaseEntity, 'id'> — конкретные поля не нужны циклу слияния,
// ему важны только id/updatedAt/deleted, общие для всех через BaseEntity.
const TABLES: Record<SyncedTable, EntityTable<BaseEntity, 'id'>> = {
  events: db.events as unknown as EntityTable<BaseEntity, 'id'>,
  tasks: db.tasks as unknown as EntityTable<BaseEntity, 'id'>,
  taskLists: db.taskLists as unknown as EntityTable<BaseEntity, 'id'>,
  habits: db.habits as unknown as EntityTable<BaseEntity, 'id'>,
  gamificationProfile: db.gamificationProfile as unknown as EntityTable<BaseEntity, 'id'>,
  appSettings: db.appSettings as unknown as EntityTable<BaseEntity, 'id'>,
}

export interface SyncResult {
  pulledAt: string | null
  pushedAt: string
}

/**
 * pull → merge (last-write-wins по updatedAt, запись за записью) → push.
 * Не зависит от конкретной реализации SyncProvider — работает одинаково с
 * MockLocalSyncProvider и будущим GoogleDriveSyncProvider.
 *
 * Медиа-blob'ы (фото задач/событий, фон приложения) в снапшот не входят —
 * их синхронизация через Drive потребует отдельной загрузки файлов и появится позже.
 */
export class SyncEngine {
  private readonly provider: SyncProvider

  constructor(provider: SyncProvider) {
    this.provider = provider
  }

  async buildLocalSnapshot(): Promise<SyncSnapshot> {
    const data: Record<string, unknown[]> = {}
    for (const table of SYNCED_TABLES) {
      data[table] = await TABLES[table].toArray()
    }
    return { version: SNAPSHOT_VERSION, updatedAt: new Date().toISOString(), data }
  }

  private async mergeSnapshotIntoLocal(remote: SyncSnapshot): Promise<void> {
    const tables = SYNCED_TABLES.map((name) => TABLES[name])
    await db.transaction('rw', tables, async () => {
      for (const table of SYNCED_TABLES) {
        const remoteRows = (remote.data[table] ?? []) as BaseEntity[]
        for (const remoteRow of remoteRows) {
          const localRow = await TABLES[table].get(remoteRow.id)
          if (!localRow || new Date(remoteRow.updatedAt) > new Date(localRow.updatedAt)) {
            await TABLES[table].put(remoteRow)
          }
        }
      }
    })
  }

  /** Вызывается при старте приложения и вручную (кнопка "синхронизировать"). */
  async sync(): Promise<SyncResult> {
    await ensureSingletons()
    const remoteSnapshot = await this.provider.pull()
    if (remoteSnapshot) {
      await this.mergeSnapshotIntoLocal(remoteSnapshot)
    }
    const mergedSnapshot = await this.buildLocalSnapshot()
    await this.provider.push(mergedSnapshot)
    return { pulledAt: remoteSnapshot?.updatedAt ?? null, pushedAt: mergedSnapshot.updatedAt }
  }
}
