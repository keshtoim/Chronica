import { useEffect } from 'react'
import { useGameEventStore, type GameEvent } from '@/store/gameEventStore'

const DISPLAY_MS = 3000

const TYPE_STYLES: Record<GameEvent['type'], string> = {
  reward: 'border-[var(--color-accent)] text-[var(--color-accent)]',
  levelup:
    'chronica-toast-levelup border-[var(--color-accent)] bg-[var(--color-accent)] px-5 py-2.5 text-base text-[var(--color-accent-contrast)]',
  damage: 'border-[var(--color-danger)] text-[var(--color-danger)]',
}

/** Смонтирован один раз в AppShell — всплывающие уведомления видны с любой страницы. */
export function GameEventToaster() {
  const events = useGameEventStore((state) => state.events)
  const dismissEvent = useGameEventStore((state) => state.dismissEvent)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 flex flex-col items-center gap-2 md:bottom-4">
      {events.map((event) => (
        <ToastItem key={event.id} event={event} onDismiss={() => dismissEvent(event.id)} />
      ))}
    </div>
  )
}

function ToastItem({ event, onDismiss }: { event: GameEvent; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, DISPLAY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={[
        'chronica-toast rounded-full border bg-[var(--color-bg)] px-4 py-2 text-sm font-medium shadow-lg',
        TYPE_STYLES[event.type],
      ].join(' ')}
    >
      {event.message}
    </div>
  )
}
