import { useState, type FormEvent } from 'react'
import { habitsRepository } from '@/data/repositories/habitsRepository'
import type { HabitFrequencyType } from '@/data/entities'

const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const COLOR_PRESETS = ['#1a73e8', '#188038', '#d93025', '#f9ab00', '#8430ce', '#616161']

const FREQUENCY_OPTIONS: { value: HabitFrequencyType; label: string }[] = [
  { value: 'daily', label: 'Каждый день' },
  { value: 'weekly', label: 'Каждую неделю' },
  { value: 'custom', label: 'Выбранные дни' },
]

export function HabitComposer() {
  const [title, setTitle] = useState('')
  const [frequencyType, setFrequencyType] = useState<HabitFrequencyType>('daily')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5])
  const [color, setColor] = useState(COLOR_PRESETS[0])

  function toggleDay(day: number) {
    setDaysOfWeek((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort(),
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    await habitsRepository.create({
      title: trimmed,
      frequency:
        frequencyType === 'custom' ? { type: 'custom', daysOfWeek } : { type: frequencyType },
      completions: [],
      currentStreak: 0,
      bestStreak: 0,
      color,
    })
    setTitle('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] p-4"
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Новая привычка"
        className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {FREQUENCY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFrequencyType(option.value)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              frequencyType === option.value
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>

      {frequencyType === 'custom' && (
        <div className="flex flex-wrap gap-1">
          {WEEKDAY_LABELS.map((label, day) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleDay(day)}
              className={[
                'h-7 w-9 rounded-md text-xs font-medium transition-colors',
                daysOfWeek.includes(day)
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
                  : 'border border-[var(--color-border)] text-[var(--color-text-muted)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setColor(preset)}
            aria-label={preset}
            style={{ backgroundColor: preset }}
            className={[
              'h-6 w-6 rounded-full border-2',
              color === preset ? 'border-[var(--color-text)]' : 'border-transparent',
            ].join(' ')}
          />
        ))}
      </div>

      <button
        type="submit"
        className="self-start rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent-contrast)]"
      >
        Добавить привычку
      </button>
    </form>
  )
}
