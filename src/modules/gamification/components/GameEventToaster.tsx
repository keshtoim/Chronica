import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameEventStore, type GameEvent } from '@/store/gameEventStore'

const DISPLAY_MS = 3000

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 24 }

const TYPE_STYLES: Record<GameEvent['type'], string> = {
  reward: 'border-[var(--color-accent)] text-[var(--color-accent)]',
  levelup: 'border-transparent px-5 py-2.5 text-base text-[var(--color-accent-contrast)]',
  damage: 'border-[var(--color-danger)] text-[var(--color-danger)]',
}

const TYPE_INLINE_STYLE: Partial<
  Record<GameEvent['type'], { background: string; boxShadow: string }>
> = {
  levelup: { background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' },
}

/** Смонтирован один раз в AppShell — всплывающие уведомления видны с любой страницы. */
export function GameEventToaster() {
  const events = useGameEventStore((state) => state.events)
  const dismissEvent = useGameEventStore((state) => state.dismissEvent)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 flex flex-col items-center gap-2 md:bottom-4">
      <AnimatePresence>
        {events.map((event) => (
          <ToastItem key={event.id} event={event} onDismiss={() => dismissEvent(event.id)} />
        ))}
      </AnimatePresence>
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={
        event.type === 'levelup'
          ? { opacity: 1, y: 0, scale: [0.85, 1.08, 1] }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={SPRING}
      style={
        TYPE_INLINE_STYLE[event.type] ?? {
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-elevated)',
        }
      }
      className={[
        'rounded-full border px-4 py-2 text-sm font-medium',
        TYPE_STYLES[event.type],
      ].join(' ')}
    >
      {event.message}
    </motion.div>
  )
}
