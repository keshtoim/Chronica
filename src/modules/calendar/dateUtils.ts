export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'

const RU_MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const RU_MONTHS_NOMINATIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export const RU_WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Понедельник как начало недели. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date)
  const offset = (day.getDay() + 6) % 7
  return addDays(day, -offset)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** 6 недель × 7 дней — фиксированная сетка месяца, начиная с понедельника недели первого числа. */
export function getMonthGridDays(cursor: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(cursor))
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

export function getWeekDays(cursor: Date): Date[] {
  const weekStart = startOfWeek(cursor)
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function formatMonthYear(date: Date): string {
  return `${RU_MONTHS_NOMINATIVE[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${RU_MONTHS_GENITIVE[date.getMonth()]}`
}

export function formatDayHeader(date: Date): string {
  return `${RU_WEEKDAYS_SHORT[(date.getDay() + 6) % 7]}, ${formatDayMonth(date)}`
}

/** YYYY-MM-DD в локальном времени (не UTC — важно для сравнения с датами всплывающих полей ввода). */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function combineDateAndTime(dateValue: string, timeValue: string): Date {
  return new Date(`${dateValue}T${timeValue}:00`)
}

export interface DateRange {
  start: Date
  end: Date
}

export function getRangeForView(view: CalendarViewMode, cursorDate: Date): DateRange {
  if (view === 'month') {
    const days = getMonthGridDays(cursorDate)
    return { start: days[0], end: addDays(days[days.length - 1], 1) }
  }
  if (view === 'week') {
    const start = startOfWeek(cursorDate)
    return { start, end: addDays(start, 7) }
  }
  if (view === 'day') {
    const start = startOfDay(cursorDate)
    return { start, end: addDays(start, 1) }
  }
  // agenda: ближайшие 30 дней
  const start = startOfDay(cursorDate)
  return { start, end: addDays(start, 30) }
}

export function shiftCursor(view: CalendarViewMode, cursorDate: Date, direction: 1 | -1): Date {
  if (view === 'month') return addMonths(cursorDate, direction)
  if (view === 'week') return addDays(cursorDate, direction * 7)
  if (view === 'day') return addDays(cursorDate, direction)
  return addDays(cursorDate, direction * 30)
}
