import { db, SINGLETON_ID, nowIso } from '@/data/db'
import type { GamificationProfile } from '@/data/entities'

/**
 * Профиль геймификации — синглтон, создаётся ensureSingletons() один раз при старте приложения
 * (main.tsx). get() — чистое чтение без транзакций, чтобы быть безопасным внутри useLiveQuery
 * (Dexie запрещает readwrite-транзакции в querier'е live query).
 */
export const gamificationRepository = {
  async get(): Promise<GamificationProfile> {
    const profile = await db.gamificationProfile.get(SINGLETON_ID)
    if (!profile)
      throw new Error('GamificationProfile singleton отсутствует после ensureSingletons()')
    return profile
  },

  async update(changes: Partial<Omit<GamificationProfile, 'id' | 'createdAt'>>): Promise<void> {
    await db.gamificationProfile.update(SINGLETON_ID, { ...changes, updatedAt: nowIso() })
  },
}
