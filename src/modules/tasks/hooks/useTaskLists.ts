import { useLiveQuery } from 'dexie-react-hooks'
import { taskListsRepository } from '@/data/repositories/taskListsRepository'

export function useTaskLists() {
  return useLiveQuery(() => taskListsRepository.list(), [])
}
