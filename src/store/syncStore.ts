import { create } from 'zustand'
import { MockLocalSyncProvider } from '@/sync/MockLocalSyncProvider'
import { GoogleDriveSyncProvider } from '@/sync/GoogleDriveSyncProvider'
import { SyncEngine } from '@/sync/SyncEngine'
import { webGoogleTokenProvider } from '@/sync/google/webTokenProvider'
import { detectPlatform } from '@/sync/google/platform'

export type SyncBackend = 'mock-local' | 'google-drive'

function createEngine(backend: SyncBackend): SyncEngine {
  if (backend === 'google-drive') {
    return new SyncEngine(new GoogleDriveSyncProvider(webGoogleTokenProvider))
  }
  return new SyncEngine(new MockLocalSyncProvider())
}

const initialBackend: SyncBackend = webGoogleTokenProvider.isConnected()
  ? 'google-drive'
  : 'mock-local'
let engine = createEngine(initialBackend)

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
  backend: SyncBackend
  syncNow: () => Promise<void>
  connectGoogleDrive: () => Promise<void>
  disconnectGoogleDrive: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  lastSyncedAt: null,
  error: null,
  backend: initialBackend,

  async syncNow() {
    set({ status: 'syncing', error: null })
    try {
      const result = await engine.sync()
      set({ status: 'synced', lastSyncedAt: result.pushedAt })
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) })
    }
  },

  async connectGoogleDrive() {
    // Реальный Google-логин внутри встроенного webview Tauri/Android Google блокирует —
    // desktop/mobile получат свои реализации GoogleTokenProvider отдельно.
    if (detectPlatform() !== 'web') {
      set({ error: 'Синхронизация с Google Drive пока доступна только в веб-версии' })
      return
    }

    set({ status: 'syncing', error: null })
    try {
      await webGoogleTokenProvider.getAccessToken({ interactive: true })
      engine = createEngine('google-drive')
      set({ backend: 'google-drive' })
      await get().syncNow()
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) })
    }
  },

  disconnectGoogleDrive() {
    webGoogleTokenProvider.disconnect()
    engine = createEngine('mock-local')
    set({ backend: 'mock-local', status: 'idle', error: null })
  },
}))
