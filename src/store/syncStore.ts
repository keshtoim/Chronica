import { create } from 'zustand'
import { MockLocalSyncProvider } from '@/sync/MockLocalSyncProvider'
import { SyncEngine } from '@/sync/SyncEngine'

// Единственное место, где выбирается реализация SyncProvider — на GoogleDriveSyncProvider
// позже переключимся заменой этой одной строки.
const syncEngine = new SyncEngine(new MockLocalSyncProvider())

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
  syncNow: () => Promise<void>
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSyncedAt: null,
  error: null,

  async syncNow() {
    set({ status: 'syncing', error: null })
    try {
      const result = await syncEngine.sync()
      set({ status: 'synced', lastSyncedAt: result.pushedAt })
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) })
    }
  },
}))
