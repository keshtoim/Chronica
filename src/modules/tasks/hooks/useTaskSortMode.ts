import { useLiveQuery } from 'dexie-react-hooks'
import { appSettingsRepository } from '@/data/repositories/appSettingsRepository'
import type { TaskSortMode } from '@/data/entities'

export function useTaskSortMode(): [TaskSortMode, (mode: TaskSortMode) => void] {
  const settings = useLiveQuery(() => appSettingsRepository.get(), [])
  const mode = settings?.taskSortMode ?? 'manual'

  function setMode(next: TaskSortMode) {
    void appSettingsRepository.update({ taskSortMode: next })
  }

  return [mode, setMode]
}
