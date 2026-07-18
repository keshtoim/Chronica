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

  /**
   * Ключ ручной сортировки для новой (под)задачи в конце своей группы (шаг 1000,
   * чтобы вставлять между соседями без переиндексации). Группа — задачи с тем же
   * parentTaskId: у подзадач и задач верхнего уровня раздельные пространства сортировки.
   */
  async nextSortOrder(listId: string, parentTaskId: string | null = null): Promise<number> {
    const siblings = (await this.listByList(listId)).filter(
      (task) => (task.parentTaskId ?? null) === parentTaskId,
    )
    if (siblings.length === 0) return SORT_ORDER_STEP
    return Math.max(...siblings.map((task) => task.sortOrder)) + SORT_ORDER_STEP
  },
}
