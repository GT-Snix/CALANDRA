import { TaskList } from '../components/TaskList'
import { formatCompactDate } from '../lib/date'

export function DayMode({ date }: { date: string }) {
  return (
    <div className="overlay-section">
      <h1 className="overlay-header">Today — {formatCompactDate(date)}</h1>
      <TaskList date={date} />
    </div>
  )
}
