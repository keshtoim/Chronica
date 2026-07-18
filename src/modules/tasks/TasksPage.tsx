import { useEffect, useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { taskListsRepository } from '@/data/repositories/taskListsRepository'
import { tasksRepository } from '@/data/repositories/tasksRepository'
import { useTaskLists } from '@/modules/tasks/hooks/useTaskLists'
import { useTasksForList } from '@/modules/tasks/hooks/useTasksForList'
import { useTaskSortMode } from '@/modules/tasks/hooks/useTaskSortMode'
import { buildDueSortedRows, buildTaskTree } from '@/modules/tasks/sorting'
import { TaskComposer } from '@/modules/tasks/components/TaskComposer'
import { TaskItemCard } from '@/modules/tasks/components/TaskItemCard'
import { TaskListSidebar } from '@/modules/tasks/components/TaskListSidebar'
import { TaskSortSwitcher } from '@/modules/tasks/components/TaskSortSwitcher'
import { TaskTreeList } from '@/modules/tasks/components/TaskTreeList'

const DEFAULT_LIST_TITLE = 'Мои задачи'

export function TasksPage() {
  const lists = useTaskLists()
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [sortMode, setSortMode] = useTaskSortMode()
  const tasks = useTasksForList(selectedListId ?? undefined)

  // Первый запуск: списков ещё нет — создаём список по умолчанию, чтобы не показывать пустой экран без возможности что-либо сделать.
  useEffect(() => {
    if (lists === undefined) return
    if (lists.length === 0) {
      void taskListsRepository
        .nextSortOrder()
        .then((sortOrder) => taskListsRepository.create({ title: DEFAULT_LIST_TITLE, sortOrder }))
        .then((list) => setSelectedListId(list.id))
      return
    }
    if (!selectedListId || !lists.some((list) => list.id === selectedListId)) {
      setSelectedListId(lists[0].id)
    }
  }, [lists, selectedListId])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !tasks) return

    const activeTask = tasks.find((task) => task.id === active.id)
    const overTask = tasks.find((task) => task.id === over.id)
    if (!activeTask || !overTask) return

    const group = activeTask.parentTaskId ?? null
    if (group !== (overTask.parentTaskId ?? null)) return // перетаскивание разрешено только внутри своей группы

    const siblings = tasks
      .filter((task) => (task.parentTaskId ?? null) === group)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    const oldIndex = siblings.findIndex((task) => task.id === active.id)
    const newIndex = siblings.findIndex((task) => task.id === over.id)
    const reordered = arrayMove(siblings, oldIndex, newIndex)

    await Promise.all(
      reordered.map((task, index) =>
        tasksRepository.update(task.id, { sortOrder: (index + 1) * 1000 }),
      ),
    )
  }

  if (!lists || !selectedListId) {
    return <div className="p-8 text-[var(--color-text-muted)]">Загрузка…</div>
  }

  const activeList = lists.find((list) => list.id === selectedListId)

  return (
    <div className="flex h-full">
      <TaskListSidebar lists={lists} selectedListId={selectedListId} onSelect={setSelectedListId} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3">
          <h1 className="truncate text-lg font-medium">{activeList?.title}</h1>
          <TaskSortSwitcher value={sortMode} onChange={setSortMode} />
        </div>

        <TaskComposer listId={selectedListId} />

        <div className="min-h-0 flex-1 overflow-auto p-3">
          {!tasks ? null : tasks.length === 0 ? (
            <p className="p-4 text-sm text-[var(--color-text-muted)]">
              Пока нет задач — добавьте первую выше.
            </p>
          ) : sortMode === 'due' ? (
            <div className="flex flex-col gap-0.5">
              {buildDueSortedRows(tasks).map((row) => (
                <TaskItemCard key={row.task.id} task={row.task} parentTitle={row.parent?.title} />
              ))}
            </div>
          ) : (
            <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
              <TaskTreeList
                nodes={buildTaskTree(tasks, sortMode)}
                draggable={sortMode === 'manual'}
              />
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}
