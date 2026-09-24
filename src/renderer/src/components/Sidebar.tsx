import { MonthCalendar } from './MonthCalendar'
import { TaskList } from './TaskList'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar({
  today,
  selectedDate,
  onSelectDate
}: {
  today: string
  selectedDate: string
  onSelectDate: (date: string) => void
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="app-title">Daylog</span>
        <ThemeToggle />
      </div>
      <MonthCalendar today={today} selectedDate={selectedDate} onSelectDate={onSelectDate} />
      <TaskList date={selectedDate} />
    </aside>
  )
}
