import { useLiveQuery } from 'dexie-react-hooks'
import { gamificationRepository } from '@/data/repositories/gamificationRepository'

export function useGamificationProfile() {
  return useLiveQuery(() => gamificationRepository.get(), [])
}
