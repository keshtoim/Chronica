import { db } from '@/data/db'
import { createRepository } from '@/data/repositories/createRepository'

const base = createRepository(db.taskLists)

const SORT_ORDER_STEP = 1000

export const taskListsRepository = {
  ...base,

  /** Ключ ручной сортировки для нового списка в конце (шаг 1000). */
  async nextSortOrder(): Promise<number> {
    const all = await base.list()
    if (all.length === 0) return SORT_ORDER_STEP
    return Math.max(...all.map((list) => list.sortOrder)) + SORT_ORDER_STEP
  },
}
