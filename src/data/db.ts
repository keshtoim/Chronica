import Dexie, { type EntityTable } from 'dexie'
import type {
  AppSettings,
  EventEntity,
  GamificationProfile,
  HabitEntity,
  TaskEntity,
  TaskListEntity,
} from '@/data/entities'

/** Единственная запись профиля геймификации и настроек приложения хранится под этим id. */
export const SINGLETON_ID = 'singleton'

class ChronicaDB extends Dexie {
  events!: EntityTable<EventEntity, 'id'>
  tasks!: EntityTable<TaskEntity, 'id'>
  taskLists!: EntityTable<TaskListEntity, 'id'>
  habits!: EntityTable<HabitEntity, 'id'>
  gamificationProfile!: EntityTable<GamificationProfile, 'id'>
  appSettings!: EntityTable<AppSettings, 'id'>
  /** blobKey -> Blob, на изображения ссылаются entities.*.photo.blobKey */
  media!: EntityTable<{ blobKey: string; blob: Blob }, 'blobKey'>

  constructor() {
    super('chronica')
    this.version(1).stores({
      events: 'id, start, end',
      tasks: 'id, listId, parentTaskId, dueDate, sortOrder',
      taskLists: 'id, sortOrder',
      habits: 'id',
      gamificationProfile: 'id',
      appSettings: 'id',
      media: 'blobKey',
    })
  }
}

export const db = new ChronicaDB()

export function nowIso(): string {
  return new Date().toISOString()
}

export function defaultGamificationProfile(): GamificationProfile {
  const timestamp = nowIso()
  return {
    id: SINGLETON_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    xp: 0,
    level: 1,
    gold: 0,
    hp: 50,
    maxHp: 50,
    onboardingComplete: false,
    rewards: [],
    xpLog: [],
    achievements: [],
    skipScrolls: 0,
  }
}

export function defaultAppSettings(): AppSettings {
  const timestamp = nowIso()
  return {
    id: SINGLETON_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    background: {
      blur: 0,
      filters: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0 },
    },
    taskSortMode: 'manual',
  }
}

/** Создаёт singleton-записи профиля и настроек при первом запуске приложения. */
export async function ensureSingletons(): Promise<void> {
  await db.transaction('rw', db.gamificationProfile, db.appSettings, async () => {
    const profile = await db.gamificationProfile.get(SINGLETON_ID)
    if (!profile) {
      await db.gamificationProfile.add(defaultGamificationProfile())
    } else {
      // Профили, созданные до появления какого-либо из этих полей, не содержат их —
      // бэкфиллим всё отсутствующее дефолтами, чтобы новые поля не оставались undefined.
      const defaults = defaultGamificationProfile()
      const profileRecord = profile as unknown as Record<string, unknown>
      const defaultsRecord = defaults as unknown as Record<string, unknown>
      const patch: Record<string, unknown> = {}
      for (const key of Object.keys(defaults)) {
        if (key === 'id' || key === 'createdAt') continue
        if (profileRecord[key] === undefined) {
          patch[key] = defaultsRecord[key]
        }
      }
      if (Object.keys(patch).length > 0) {
        await db.gamificationProfile.update(SINGLETON_ID, patch as Partial<GamificationProfile>)
      }
    }
    const settings = await db.appSettings.get(SINGLETON_ID)
    if (!settings) {
      await db.appSettings.add(defaultAppSettings())
    }
  })
}
