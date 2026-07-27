import { create } from 'zustand'
import { MockLocalSyncProvider } from '@/sync/MockLocalSyncProvider'
import { GoogleDriveSyncProvider } from '@/sync/GoogleDriveSyncProvider'
import { SyncEngine } from '@/sync/SyncEngine'
import { webGoogleTokenProvider } from '@/sync/google/webTokenProvider'
import { desktopGoogleTokenProvider } from '@/sync/google/desktopTokenProvider'
import { detectPlatform } from '@/sync/google/platform'
import type { GoogleTokenProvider } from '@/sync/google/tokenProvider'

export type SyncBackend = 'mock-local' | 'google-drive'

/** null — платформа пока не поддерживает Google Drive sync (mobile — следующий шаг). */
function getGoogleTokenProvider(): GoogleTokenProvider | null {
  const platform = detectPlatform()
  if (platform === 'web') return webGoogleTokenProvider
  if (platform === 'tauri-desktop') return desktopGoogleTokenProvider
  return null
}

const activeTokenProvider = getGoogleTokenProvider()

function createEngine(backend: SyncBackend): SyncEngine {
  if (backend === 'google-drive' && activeTokenProvider) {
    return new SyncEngine(new GoogleDriveSyncProvider(activeTokenProvider))
  }
  return new SyncEngine(new MockLocalSyncProvider())
}

const initialBackend: SyncBackend = activeTokenProvider?.isConnected()
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
    if (!activeTokenProvider) {
      set({
        error: `Синхронизация с Google Drive пока не поддерживается на этой платформе (${detectPlatform()})`,
      })
      return
    }

    set({ status: 'syncing', error: null })
    try {
      await activeTokenProvider.getAccessToken({ interactive: true })
      engine = createEngine('google-drive')
      set({ backend: 'google-drive' })
      await get().syncNow()
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) })
    }
  },

  disconnectGoogleDrive() {
    activeTokenProvider?.disconnect()
    engine = createEngine('mock-local')
    set({ backend: 'mock-local', status: 'idle', error: null })
  },
}))
