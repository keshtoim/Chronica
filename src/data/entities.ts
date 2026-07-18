/** Общие поля для всех сущностей — обеспечивают soft-delete и разрешение конфликтов синхронизации. */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  /** Tombstone для синхронизации: запись считается удалённой, но не стирается сразу. */
  deleted?: boolean
}

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
  zoom: number
}

/** Ссылка на изображение, хранящееся как blob в Dexie (см. MEDIA_TABLE в db.ts). */
export interface MediaRef {
  blobKey: string
  crop?: CropRect
}

export interface EventEntity extends BaseEntity {
  title: string
  notes?: string
  /** ISO datetime */
  start: string
  /** ISO datetime */
  end: string
  allDay: boolean
  /** RRULE-строка (rrule.js) */
  recurrenceRule?: string
  /** ISO-даты, исключённые из повторения */
  recurrenceExceptions?: string[]
  photo?: MediaRef
  color?: string
}

export type TaskSortMode = 'manual' | 'created' | 'due'

export interface TaskEntity extends BaseEntity {
  listId: string
  title: string
  notes?: string
  /** ISO date/datetime */
  dueDate?: string
  completed: boolean
  completedAt?: string
  /** null/undefined — задача верхнего уровня, иначе id родительской задачи (подзадача) */
  parentTaskId?: string | null
  /** Ключ ручной сортировки, шаг 1000 — позволяет вставлять между элементами без переиндексации */
  sortOrder: number
  photo?: MediaRef
}

export interface TaskListEntity extends BaseEntity {
  title: string
  sortOrder: number
}

export type HabitFrequencyType = 'daily' | 'weekly' | 'custom'

export interface HabitFrequency {
  type: HabitFrequencyType
  /** Для weekly/custom: 0 = воскресенье .. 6 = суббота */
  daysOfWeek?: number[]
  timesPerPeriod?: number
}

export interface HabitCompletion {
  /** ISO date (без времени) */
  date: string
  count: number
}

export interface HabitEntity extends BaseEntity {
  title: string
  frequency: HabitFrequency
  completions: HabitCompletion[]
  currentStreak: number
  bestStreak: number
  photo?: MediaRef
  color?: string
}

export type XpSourceType = 'task' | 'habit' | 'event'

export interface XpLogEntry {
  sourceId: string
  sourceType: XpSourceType
  amount: number
  /** ISO datetime */
  date: string
}

export interface RewardEntity {
  id: string
  name: string
  cost: number
}

export interface GamificationProfile extends BaseEntity {
  xp: number
  level: number
  gold: number
  hp: number
  maxHp: number
  avatar: {
    baseId: string
    unlockedItemIds: string[]
  }
  rewards: RewardEntity[]
  xpLog: XpLogEntry[]
}

export interface BackgroundFilters {
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  sepia: number
}

export interface BackgroundSettings {
  imageRef?: MediaRef
  crop?: CropRect
  /** 0-20 */
  blur: number
  filters: BackgroundFilters
}

export interface AppSettings extends BaseEntity {
  background: BackgroundSettings
  taskSortMode: TaskSortMode
  /** ISO-дата последней проверки пропущенных daily-привычек (штраф HP начисляется не чаще раза в день). */
  lastPenaltyCheckDate?: string
}
