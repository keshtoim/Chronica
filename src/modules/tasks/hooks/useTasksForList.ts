import { useLiveQuery } from 'dexie-react-hooks'
import { tasksRepository } from '@/data/repositories/tasksRepository'

export function useTasksForList(listId: string | undefined) {
  return useLiveQuery(
    () => (listId ? tasksRepository.listByList(listId) : Promise.resolve([])),
    [listId],
  )
}
