import { useState } from 'react'
import { parseLocalDate } from '../lib/date'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

interface DayCell {
  day: number
  dateKey: string
}

export function MonthCalendar({
  today,
  selectedDate,
  onSelectDate
}: {
  today: string
  selectedDate: string
  onSelectDate: (date: string) => void
}) {
  const initial = parseLocalDate(selectedDate)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startWeekday = firstOfMonth.getDay()
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  })

  const cells: (DayCell | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, dateKey: toDateKey(viewYear, viewMonth, day) })
  }

  function goPrevMonth(): void {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goNextMonth(): void {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  return (
    <div className="month-calendar">
      <div className="month-calendar-header">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={goPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeftIcon />
        </button>
        <span className="month-label">{monthLabel}</span>
        <button
          type="button"
          className="cal-nav-btn"
          onClick={goNextMonth}
          aria-label="Next month"
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="weekday-row">
        {WEEKDAY_LABELS.map((w, i) => (
          <span key={i} className="weekday-cell">
            {w}
          </span>
        ))}
      </div>
      <div className="day-grid">
        {cells.map((cell, i) => {
          if (!cell) return <span key={i} className="day-cell day-cell-empty" />
          const isToday = cell.dateKey === today
          const isSelected = cell.dateKey === selectedDate
          const className = [
            'day-cell',
            isToday && 'day-cell-today',
            isSelected && 'day-cell-selected'
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={cell.dateKey}
              type="button"
              className={className}
              onClick={() => onSelectDate(cell.dateKey)}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
