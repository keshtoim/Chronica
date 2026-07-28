import { create } from 'zustand'

export type GameEventType = 'reward' | 'levelup' | 'damage' | 'achievement'

export interface GameEvent {
  id: string
  type: GameEventType
  message: string
}

interface GameEventState {
  events: GameEvent[]
  pushEvent: (type: GameEventType, message: string) => void
  dismissEvent: (id: string) => void
}

let counter = 0

/**
 * Всплывающие уведомления геймификации (XP/золото/level-up/урон) — наполняется из
 * src/modules/gamification/engine.ts, отображается через GameEventToaster, смонтированный
 * один раз в AppShell, чтобы события были видны с любой страницы.
 */
export const useGameEventStore = create<GameEventState>((set) => ({
  events: [],

  pushEvent(type, message) {
    counter += 1
    const id = `${Date.now()}-${counter}`
    set((state) => ({ events: [...state.events, { id, type, message }] }))
  },

  dismissEvent(id) {
    set((state) => ({ events: state.events.filter((event) => event.id !== id) }))
  },
}))
