import { db, SINGLETON_ID, ensureSingletons, nowIso } from '@/data/db'
import type { AppSettings } from '@/data/entities'

/** Настройки приложения — синглтон, создаётся ensureSingletons() при первом запуске. */
export const appSettingsRepository = {
  async get(): Promise<AppSettings> {
    await ensureSingletons()
    const settings = await db.appSettings.get(SINGLETON_ID)
    if (!settings) throw new Error('AppSettings singleton отсутствует после ensureSingletons()')
    return settings
  },

  async update(changes: Partial<Omit<AppSettings, 'id' | 'createdAt'>>): Promise<void> {
    await db.appSettings.update(SINGLETON_ID, { ...changes, updatedAt: nowIso() })
  },
}
