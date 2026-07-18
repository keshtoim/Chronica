import { useState, type FormEvent } from 'react'
import { eventsRepository } from '@/data/repositories/eventsRepository'
import type { EventOccurrence } from '@/modules/calendar/occurrences'
import { toDateKey } from '@/modules/calendar/occurrences'
import {
  combineDateAndTime,
  toDateInputValue,
  toTimeInputValue,
} from '@/modules/calendar/dateUtils'

export type EventModalState =
  | { mode: 'create'; start: Date; end: Date; allDay: boolean }
  | { mode: 'edit'; occurrence: EventOccurrence }

const COLOR_PRESETS = [
  { value: '#1a73e8', label: 'Синий' },
  { value: '#188038', label: 'Зелёный' },
  { value: '#d93025', label: 'Красный' },
  { value: '#f9ab00', label: 'Жёлтый' },
  { value: '#8430ce', label: 'Фиолетовый' },
  { value: '#616161', label: 'Серый' },
]

const RECURRENCE_OPTIONS = [
  { value: '', label: 'Не повторяется' },
  { value: 'FREQ=DAILY', label: 'Ежедневно' },
  { value: 'FREQ=WEEKLY', label: 'Еженедельно' },
  { value: 'FREQ=MONTHLY', label: 'Ежемесячно' },
  { value: 'FREQ=YEARLY', label: 'Ежегодно' },
]

interface Props {
  state: EventModalState
  onClose: () => void
}

export function EventModal({ state, onClose }: Props) {
  const existing = state.mode === 'edit' ? state.occurrence.event : undefined
  const initialStart = state.mode === 'edit' ? state.occurrence.start : state.start
  const initialEnd = state.mode === 'edit' ? state.occurrence.end : state.end
  const initialAllDay = state.mode === 'edit' ? existing!.allDay : state.allDay

  const [title, setTitle] = useState(existing?.title ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [allDay, setAllDay] = useState(initialAllDay)
  const [startDate, setStartDate] = useState(toDateInputValue(initialStart))
  const [startTime, setStartTime] = useState(toTimeInputValue(initialStart))
  const [endDate, setEndDate] = useState(toDateInputValue(initialEnd))
  const [endTime, setEndTime] = useState(toTimeInputValue(initialEnd))
  const [color, setColor] = useState(existing?.color ?? COLOR_PRESETS[0].value)
  const [recurrenceRule, setRecurrenceRule] = useState(existing?.recurrenceRule ?? '')
  const [error, setError] = useState<string | null>(null)

  function computeStartEnd(): { start: Date; end: Date } {
    if (allDay) {
      const start = combineDateAndTime(startDate, '00:00')
      const end = combineDateAndTime(endDate, '00:00')
      end.setDate(end.getDate() + 1) // конец all-day события — начало следующего дня (эксклюзивно)
      return { start, end }
    }
    return {
      start: combineDateAndTime(startDate, startTime),
      end: combineDateAndTime(endDate, endTime),
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Укажите название события')
      return
    }
    const { start, end } = computeStartEnd()
    if (end <= start) {
      setError('Окончание должно быть позже начала')
      return
    }

    const payload = {
      title: trimmedTitle,
      notes: notes.trim() || undefined,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay,
      color,
      recurrenceRule: recurrenceRule || undefined,
    }

    if (state.mode === 'edit') {
      await eventsRepository.update(existing!.id, payload)
    } else {
      await eventsRepository.create(payload)
    }
    onClose()
  }

  async function handleDeleteSeries() {
    if (!existing) return
    if (!window.confirm(`Удалить событие «${existing.title}»?`)) return
    await eventsRepository.remove(existing.id)
    onClose()
  }

  async function handleDeleteOccurrence() {
    if (state.mode !== 'edit' || !existing) return
    const key = toDateKey(state.occurrence.start)
    const exceptions = [...(existing.recurrenceExceptions ?? []), key]
    await eventsRepository.update(existing.id, { recurrenceExceptions: exceptions })
    onClose()
  }

  const isEditingRecurring = state.mode === 'edit' && state.occurrence.isRecurring

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-xl"
      >
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Название события"
          className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-base outline-none"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(event) => setAllDay(event.target.checked)}
          />
          Весь день
        </label>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--color-text-muted)]">С</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 [color-scheme:light_dark]"
          />
          {!allDay && (
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 [color-scheme:light_dark]"
            />
          )}
          <span className="text-[var(--color-text-muted)]">по</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 [color-scheme:light_dark]"
          />
          {!allDay && (
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 [color-scheme:light_dark]"
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-muted)]">Повтор</span>
          <select
            value={recurrenceRule}
            onChange={(event) => setRecurrenceRule(event.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1"
          >
            {RECURRENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setColor(preset.value)}
              title={preset.label}
              aria-label={preset.label}
              style={{ backgroundColor: preset.value }}
              className={[
                'h-6 w-6 rounded-full border-2',
                color === preset.value ? 'border-[var(--color-text)]' : 'border-transparent',
              ].join(' ')}
            />
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Заметки"
          rows={3}
          className="resize-none rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none"
        />

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <div className="mt-1 flex items-center gap-2">
          {state.mode === 'edit' && (
            <>
              {isEditingRecurring && (
                <button
                  type="button"
                  onClick={() => void handleDeleteOccurrence()}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
                >
                  Удалить это вхождение
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleDeleteSeries()}
                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-hover)]"
              >
                {isEditingRecurring ? 'Удалить всю серию' : 'Удалить'}
              </button>
            </>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent-contrast)]"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
