import { db } from '@/data/db'
import { createRepository } from '@/data/repositories/createRepository'

const base = createRepository(db.tasks)

const SORT_ORDER_STEP = 1000

export const tasksRepository = {
  ...base,

  async listByList(listId: string) {
    const all = await base.list()
    return all.filter((task) => task.listId === listId)
  },

  /** Ключ ручной сортировки для новой задачи в конце списка (шаг 1000, чтобы вставлять между без переиндексации). */
  async nextSortOrder(listId: string): Promise<number> {
    const siblings = await this.listByList(listId)
    if (siblings.length === 0) return SORT_ORDER_STEP
    return Math.max(...siblings.map((task) => task.sortOrder)) + SORT_ORDER_STEP
  },
}
