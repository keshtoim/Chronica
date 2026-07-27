import { useLiveQuery } from 'dexie-react-hooks'
import { tasksRepository } from '@/data/repositories/tasksRepository'

export function useAllTasks() {
  return useLiveQuery(() => tasksRepository.list(), [])
}
