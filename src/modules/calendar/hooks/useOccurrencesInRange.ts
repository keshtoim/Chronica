import { useMemo } from 'react'
import { useEvents } from '@/modules/calendar/hooks/useEvents'
import { expandOccurrences } from '@/modules/calendar/occurrences'

export function useOccurrencesInRange(rangeStart: Date, rangeEnd: Date) {
  const events = useEvents()
  const startTime = rangeStart.getTime()
  const endTime = rangeEnd.getTime()

  return useMemo(() => {
    if (!events) return undefined
    return expandOccurrences(events, new Date(startTime), new Date(endTime))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, startTime, endTime])
}
