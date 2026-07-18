import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { TaskEntity } from '@/data/entities'
import { tasksRepository } from '@/data/repositories/tasksRepository'
import { grantReward } from '@/modules/gamification/engine'

interface Props {
  task: TaskEntity
  /** Заголовок родительской задачи — показывается как контекст для подзадачи в плоских списках (сортировка по сроку). */
  parentTitle?: string
}

export function TaskItemCard({ task, parentTitle }: Props) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(task.title)
  const [showNotes, setShowNotes] = useState(Boolean(task.notes))
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')

  async function toggleCompleted() {
    const completed = !task.completed
    await tasksRepository.update(task.id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    })
    if (completed) await grantReward('task', task.id)
  }

  async function saveTitle() {
    setEditingTitle(false)
    const trimmed = titleDraft.trim()
    if (!trimmed || trimmed === task.title) {
      setTitleDraft(task.title)
      return
    }
    await tasksRepository.update(task.id, { title: trimmed })
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') void saveTitle()
    if (event.key === 'Escape') {
      setTitleDraft(task.title)
      setEditingTitle(false)
    }
  }

  async function saveDueDate(value: string) {
    await tasksRepository.update(task.id, { dueDate: value || undefined })
  }

  async function saveNotes(value: string) {
    await tasksRepository.update(task.id, { notes: value || undefined })
  }

  async function handleDelete() {
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) return
    await tasksRepository.remove(task.id)
  }

  async function handleAddSubtask(event: FormEvent) {
    event.preventDefault()
    const trimmed = subtaskTitle.trim()
    if (!trimmed) return
    const sortOrder = await tasksRepository.nextSortOrder(task.listId, task.id)
    await tasksRepository.create({
      listId: task.listId,
      parentTaskId: task.id,
      title: trimmed,
      completed: false,
      sortOrder,
    })
    setSubtaskTitle('')
    setShowSubtaskInput(false)
  }

  return (
    <div className="rounded-lg px-2 py-1.5 hover:bg-[var(--color-surface-hover)]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => void toggleCompleted()}
          aria-label={task.completed ? 'Снять отметку о выполнении' : 'Отметить как выполненное'}
          className={[
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none',
            task.completed
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
              : 'border-[var(--color-text-muted)]',
          ].join(' ')}
        >
          {task.completed ? '✓' : ''}
        </button>

        <div className="min-w-0 flex-1">
          {parentTitle && (
            <div className="truncate text-xs text-[var(--color-text-muted)]">↳ {parentTitle}</div>
          )}

          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={() => void saveTitle()}
              onKeyDown={handleTitleKeyDown}
              className="w-full bg-transparent text-sm outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className={[
                'block w-full truncate text-left text-sm',
                task.completed
                  ? 'text-[var(--color-text-muted)] line-through'
                  : 'text-[var(--color-text)]',
              ].join(' ')}
            >
              {task.title}
            </button>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <label className="flex items-center gap-1">
              <span aria-hidden="true">📅</span>
              <input
                type="date"
                value={task.dueDate ?? ''}
                onChange={(event) => void saveDueDate(event.target.value)}
                className="bg-transparent outline-none [color-scheme:light_dark]"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowNotes((value) => !value)}
              className="hover:underline"
            >
              Заметка
            </button>
            <button
              type="button"
              onClick={() => setShowSubtaskInput((value) => !value)}
              className="hover:underline"
            >
              + Подзадача
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="ml-auto text-[var(--color-danger)] hover:underline"
            >
              Удалить
            </button>
          </div>

          {showNotes && (
            <textarea
              defaultValue={task.notes ?? ''}
              onBlur={(event) => void saveNotes(event.target.value)}
              placeholder="Заметка…"
              rows={2}
              className="mt-1 w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent p-1.5 text-xs outline-none"
            />
          )}

          {showSubtaskInput && (
            <form onSubmit={handleAddSubtask} className="mt-1 flex items-center gap-1">
              <input
                autoFocus
                value={subtaskTitle}
                onChange={(event) => setSubtaskTitle(event.target.value)}
                placeholder="Новая подзадача"
                className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs outline-none"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
