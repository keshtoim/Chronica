import { db, SINGLETON_ID, ensureSingletons, nowIso } from '@/data/db'
import type { GamificationProfile } from '@/data/entities'

/** Профиль геймификации — синглтон, создаётся ensureSingletons() при первом запуске. */
export const gamificationRepository = {
  async get(): Promise<GamificationProfile> {
    await ensureSingletons()
    const profile = await db.gamificationProfile.get(SINGLETON_ID)
    if (!profile)
      throw new Error('GamificationProfile singleton отсутствует после ensureSingletons()')
    return profile
  },

  async update(changes: Partial<Omit<GamificationProfile, 'id' | 'createdAt'>>): Promise<void> {
    await db.gamificationProfile.update(SINGLETON_ID, { ...changes, updatedAt: nowIso() })
  },
}
