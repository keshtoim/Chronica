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
    nickname: '',
    characterClass: 'warrior',
    xp: 0,
    level: 1,
    gold: 0,
    hp: 50,
    maxHp: 50,
    onboardingComplete: false,
    rewards: [],
    xpLog: [],
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
    } else if (profile.characterClass === undefined || profile.onboardingComplete === undefined) {
      // Профили, созданные до появления персонажа/онбординга, не содержат этих полей —
      // без бэкфилла characterClass остаётся undefined и роняет CLASS_DEFS[undefined] при рендере.
      const defaults = defaultGamificationProfile()
      await db.gamificationProfile.update(SINGLETON_ID, {
        nickname: profile.nickname ?? defaults.nickname,
        characterClass: profile.characterClass ?? defaults.characterClass,
        onboardingComplete: profile.onboardingComplete ?? defaults.onboardingComplete,
      })
    }
    const settings = await db.appSettings.get(SINGLETON_ID)
    if (!settings) {
      await db.appSettings.add(defaultAppSettings())
    }
  })
}
