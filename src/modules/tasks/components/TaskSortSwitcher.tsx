import type { TaskSortMode } from '@/data/entities'

const OPTIONS: { mode: TaskSortMode; label: string }[] = [
  { mode: 'manual', label: 'Свой порядок' },
  { mode: 'created', label: 'По дате создания' },
  { mode: 'due', label: 'По сроку' },
]

interface Props {
  value: TaskSortMode
  onChange: (mode: TaskSortMode) => void
}

export function TaskSortSwitcher({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-full border border-[var(--color-border)] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          onClick={() => onChange(option.mode)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            option.mode === value
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-contrast)]'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
