import { Link } from 'react-router-dom'
import { useAllTasks } from '@/modules/tasks/hooks/useAllTasks'
import { buildDueSortedRows } from '@/modules/tasks/sorting'
import { TaskItemCard } from '@/modules/tasks/components/TaskItemCard'
import { useOccurrencesInRange } from '@/modules/calendar/hooks/useOccurrencesInRange'
import { getRangeForView, toDateKey } from '@/modules/calendar/dateUtils'

/**
 * Объединённая лента "что нужно сегодня": просроченные и сегодняшние задачи + события дня.
 * Клик по событию ведёт в полный календарь — здесь только чтение, без дублирования
 * состояния модалки редактирования из CalendarPage.
 */
export function TodayColumn() {
  const allTasks = useAllTasks()
  const range = getRangeForView('day', new Date())
  const occurrences = useOccurrencesInRange(range.start, range.end)
  const todayKey = toDateKey(new Date())

  const dueRows = allTasks
    ? buildDueSortedRows(
        allTasks.filter((task) => !task.completed && task.dueDate && task.dueDate <= todayKey),
      )
    : []

  const isEmpty = dueRows.length === 0 && (!occurrences || occurrences.length === 0)

  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-glass)] p-4 shadow-soft backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Сегодня</h2>
        <Link to="/tasks" className="text-xs text-[var(--color-accent)] hover:underline">
          Все задачи →
        </Link>
      </div>

      {isEmpty ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          На сегодня ничего не запланировано — можно расслабиться.
        </p>
      ) : (
        <>
          {dueRows.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {dueRows.map((row) => (
                <TaskItemCard key={row.task.id} task={row.task} parentTitle={row.parent?.title} />
              ))}
            </div>
          )}

          {occurrences && occurrences.length > 0 && (
            <div className="mt-3 flex flex-col gap-0.5 border-t border-[var(--color-border)] pt-3">
              {occurrences.map((occurrence) => (
                <Link
                  key={occurrence.occurrenceKey}
                  to="/calendar"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
                >
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: occurrence.event.color ?? '#1a73e8' }}
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                  />
                  <span className="truncate">{occurrence.event.title}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
