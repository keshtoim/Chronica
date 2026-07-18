import { db, SINGLETON_ID, nowIso } from '@/data/db'
import type { AppSettings } from '@/data/entities'

/**
 * Настройки приложения — синглтон, создаётся ensureSingletons() один раз при старте приложения
 * (main.tsx). get() — чистое чтение без транзакций, чтобы быть безопасным внутри useLiveQuery
 * (Dexie запрещает readwrite-транзакции в querier'е live query).
 */
export const appSettingsRepository = {
  async get(): Promise<AppSettings> {
    const settings = await db.appSettings.get(SINGLETON_ID)
    if (!settings) throw new Error('AppSettings singleton отсутствует после ensureSingletons()')
    return settings
  },

  async update(changes: Partial<Omit<AppSettings, 'id' | 'createdAt'>>): Promise<void> {
    await db.appSettings.update(SINGLETON_ID, { ...changes, updatedAt: nowIso() })
  },
}
