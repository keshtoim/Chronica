import { useLiveQuery } from 'dexie-react-hooks'
import { habitsRepository } from '@/data/repositories/habitsRepository'

export function useHabits() {
  return useLiveQuery(() => habitsRepository.list(), [])
}
