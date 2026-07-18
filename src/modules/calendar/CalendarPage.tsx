import { useState } from 'react'
import {
  formatDayMonth,
  formatMonthYear,
  getMonthGridDays,
  getRangeForView,
  getWeekDays,
  shiftCursor,
  type CalendarViewMode,
} from '@/modules/calendar/dateUtils'
import { useOccurrencesInRange } from '@/modules/calendar/hooks/useOccurrencesInRange'
import { CalendarToolbar } from '@/modules/calendar/components/CalendarToolbar'
import { MonthView } from '@/modules/calendar/components/MonthView'
import { TimeGridView } from '@/modules/calendar/components/TimeGridView'
import { EventModal, type EventModalState } from '@/modules/calendar/components/EventModal'
import type { EventOccurrence } from '@/modules/calendar/occurrences'

export function CalendarPage() {
  const [view, setView] = useState<CalendarViewMode>('month')
  const [cursorDate, setCursorDate] = useState(() => new Date())
  const [modalState, setModalState] = useState<EventModalState | null>(null)

  const range = getRangeForView(view, cursorDate)
  const occurrences = useOccurrencesInRange(range.start, range.end)

  function openCreateModal(day: Date) {
    const start = new Date(day)
    start.setHours(9, 0, 0, 0)
    const end = new Date(start)
    end.setHours(10, 0, 0, 0)
    setModalState({ mode: 'create', start, end, allDay: false })
  }

  function openCreateModalForSlot(start: Date, end: Date) {
    setModalState({ mode: 'create', start, end, allDay: false })
  }

  function openEditModal(occurrence: EventOccurrence) {
    setModalState({ mode: 'edit', occurrence })
  }

  const label =
    view === 'day'
      ? formatDayMonth(cursorDate) + ' ' + cursorDate.getFullYear()
      : formatMonthYear(cursorDate)

  return (
    <div className="flex h-full flex-col">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        label={label}
        onPrev={() => setCursorDate((date) => shiftCursor(view, date, -1))}
        onNext={() => setCursorDate((date) => shiftCursor(view, date, 1))}
        onToday={() => setCursorDate(new Date())}
        onCreate={() => openCreateModal(new Date())}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {view === 'month' && (
          <MonthView
            days={getMonthGridDays(cursorDate)}
            cursorDate={cursorDate}
            occurrences={occurrences}
            onDayClick={openCreateModal}
            onEventClick={openEditModal}
          />
        )}
        {(view === 'week' || view === 'day') && (
          <TimeGridView
            days={view === 'week' ? getWeekDays(cursorDate) : [cursorDate]}
            occurrences={occurrences}
            onSlotClick={openCreateModalForSlot}
            onEventClick={openEditModal}
          />
        )}
        {view === 'agenda' && (
          <div className="p-8 text-[var(--color-text-muted)]">
            Повестка дня будет добавлена следующим шагом.
          </div>
        )}
      </div>

      {modalState && <EventModal state={modalState} onClose={() => setModalState(null)} />}
    </div>
  )
}
