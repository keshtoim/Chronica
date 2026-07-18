import { useState, type FormEvent } from 'react'
import { tasksRepository } from '@/data/repositories/tasksRepository'

export function TaskComposer({ listId }: { listId: string }) {
  const [title, setTitle] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const sortOrder = await tasksRepository.nextSortOrder(listId, null)
    await tasksRepository.create({
      listId,
      title: trimmed,
      completed: false,
      parentTaskId: null,
      sortOrder,
    })
    setTitle('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3"
    >
      <span className="text-lg text-[var(--color-text-muted)]" aria-hidden="true">
        +
      </span>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Добавить задачу"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
      />
    </form>
  )
}
