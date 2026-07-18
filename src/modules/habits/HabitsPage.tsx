import { useHabits } from '@/modules/habits/hooks/useHabits'
import { HabitCard } from '@/modules/habits/components/HabitCard'
import { HabitComposer } from '@/modules/habits/components/HabitComposer'

export function HabitsPage() {
  const habits = useHabits()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-lg font-medium">Привычки</h1>

      <HabitComposer />

      {habits === undefined ? null : habits.length === 0 ? (
        <p className="p-4 text-sm text-[var(--color-text-muted)]">
          Пока нет привычек — добавьте первую выше.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  )
}
