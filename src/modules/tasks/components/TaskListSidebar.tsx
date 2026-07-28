import { useState, type FormEvent } from 'react'
import type { TaskListEntity } from '@/data/entities'
import { taskListsRepository } from '@/data/repositories/taskListsRepository'
import { tasksRepository } from '@/data/repositories/tasksRepository'

interface Props {
  lists: TaskListEntity[]
  selectedListId: string | null
  onSelect: (listId: string) => void
}

export function TaskListSidebar({ lists, selectedListId, onSelect }: Props) {
  const [newListTitle, setNewListTitle] = useState('')

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    const trimmed = newListTitle.trim()
    if (!trimmed) return
    const sortOrder = await taskListsRepository.nextSortOrder()
    const list = await taskListsRepository.create({ title: trimmed, sortOrder })
    setNewListTitle('')
    onSelect(list.id)
  }

  async function handleDelete(list: TaskListEntity) {
    if (lists.length <= 1) return
    if (!window.confirm(`Удалить список «${list.title}» вместе со всеми задачами?`)) return
    const tasks = await tasksRepository.listByList(list.id)
    await Promise.all(tasks.map((task) => tasksRepository.remove(task.id)))
    await taskListsRepository.remove(list.id)
    if (selectedListId === list.id) {
      const remaining = lists.filter((item) => item.id !== list.id)
      if (remaining[0]) onSelect(remaining[0].id)
    }
  }

  return (
    <aside className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--color-border)] p-2 md:w-60 md:flex-col md:items-stretch md:overflow-auto md:border-r md:border-b-0 md:p-3">
      <h2 className="hidden px-2 pb-2 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase md:block">
        Списки
      </h2>

      {lists.map((list) => (
        <div key={list.id} className="group flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onSelect(list.id)}
            className={[
              'flex-1 truncate rounded-full px-3 py-1.5 text-left text-sm whitespace-nowrap transition-colors',
              list.id === selectedListId
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
                : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
            ].join(' ')}
          >
            {list.title}
          </button>
          {lists.length > 1 && (
            <button
              type="button"
              onClick={() => void handleDelete(list)}
              className="hidden shrink-0 rounded-full px-2 py-1 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] group-hover:block"
              title="Удалить список"
              aria-label={`Удалить список ${list.title}`}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <form onSubmit={handleCreate} className="shrink-0 px-1 md:mt-2 md:w-full md:px-2">
        <input
          value={newListTitle}
          onChange={(event) => setNewListTitle(event.target.value)}
          placeholder="Новый список"
          className="w-36 rounded-full border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm outline-none md:w-full"
        />
      </form>
    </aside>
  )
}
