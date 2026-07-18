import { useLiveQuery } from 'dexie-react-hooks'
import { eventsRepository } from '@/data/repositories/eventsRepository'

export function useEvents() {
  return useLiveQuery(() => eventsRepository.list(), [])
}
