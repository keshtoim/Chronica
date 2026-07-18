import type { TaskEntity, TaskSortMode } from '@/data/entities'

export interface TaskNode {
  task: TaskEntity
  children: TaskNode[]
}

/**
 * Строит дерево задача → подзадачи для режимов 'manual' и 'created'. Порядок сравнения
 * применяется отдельно внутри каждой группы братьев/сестёр (общий parentTaskId).
 */
export function buildTaskTree(tasks: TaskEntity[], mode: Exclude<TaskSortMode, 'due'>): TaskNode[] {
  const byParent = new Map<string | null, TaskEntity[]>()
  for (const task of tasks) {
    const key = task.parentTaskId ?? null
    const list = byParent.get(key)
    if (list) list.push(task)
    else byParent.set(key, [task])
  }

  const compare =
    mode === 'created'
      ? (a: TaskEntity, b: TaskEntity) => a.createdAt.localeCompare(b.createdAt)
      : (a: TaskEntity, b: TaskEntity) => a.sortOrder - b.sortOrder

  function build(parentId: string | null): TaskNode[] {
    const children = (byParent.get(parentId) ?? []).slice().sort(compare)
    return children.map((task) => ({ task, children: build(task.id) }))
  }

  return build(null)
}

export interface DueTaskRow {
  task: TaskEntity
  /** Родительская задача, если это подзадача — для отображения контекста в плоском списке. */
  parent?: TaskEntity
}

/**
 * Сортировка "по сроку": все задачи и подзадачи попадают в один плоский список,
 * упорядоченный по собственному dueDate (без даты — в конец). Подзадача сортируется
 * по своей дате, а не по дате родителя, но несёт ссылку на родителя для контекста в UI.
 */
export function buildDueSortedRows(tasks: TaskEntity[]): DueTaskRow[] {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const rows: DueTaskRow[] = tasks.map((task) => ({
    task,
    parent: task.parentTaskId ? byId.get(task.parentTaskId) : undefined,
  }))

  return rows.sort((a, b) => {
    const dueA = a.task.dueDate
    const dueB = b.task.dueDate
    if (dueA && dueB) {
      const cmp = dueA.localeCompare(dueB)
      return cmp !== 0 ? cmp : a.task.createdAt.localeCompare(b.task.createdAt)
    }
    if (dueA && !dueB) return -1
    if (!dueA && dueB) return 1
    return a.task.createdAt.localeCompare(b.task.createdAt)
  })
}
