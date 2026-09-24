import { useEffect, useState } from 'react'
import type { TaskRecord } from '../../../shared/ipc'

export function RolloverSection({
  endingDay,
  endingDayLabel,
  onCarried
}: {
  endingDay: string
  endingDayLabel: 'today' | 'yesterday'
  onCarried: () => void
}) {
  const [tasks, setTasks] = useState<TaskRecord[] | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    function load(): void {
      window.daylog.loadUnresolvedForRollover(endingDay).then((result) => {
        if (!cancelled) setTasks(result)
      })
    }
    setTasks(undefined)
    load()
    const unsubscribe = window.daylog.onTasksChanged(({ affectedDate }) => {
      if (affectedDate === endingDay) load()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [endingDay])

  async function carry(taskId: number): Promise<void> {
    setTasks((prev) => prev?.filter((t) => t.id !== taskId))
    await window.daylog.carryTask(taskId)
    onCarried()
  }

  async function drop(taskId: number): Promise<void> {
    setTasks((prev) => prev?.filter((t) => t.id !== taskId))
    await window.daylog.dropTask(taskId)
  }

  // Rendered only when there's something to resolve — no empty state, and
  // no flash while the initial load is still in flight.
  if (!tasks || tasks.length === 0) return null

  return (
    <div className="overlay-section rollover-section">
      <h2 className="overlay-subheader">Still open from {endingDayLabel}:</h2>
      <ul className="rollover-items">
        {tasks.map((t) => (
          <li key={t.id} className="rollover-item">
            <span className="rollover-text">{t.text}</span>
            <div className="rollover-actions">
              <button type="button" className="rollover-btn" onClick={() => carry(t.id)}>
                Carry to tomorrow
              </button>
              <button
                type="button"
                className="rollover-btn rollover-btn-drop"
                onClick={() => drop(t.id)}
              >
                Drop
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
