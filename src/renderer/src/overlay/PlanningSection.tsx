import { useEffect, useState, type FormEvent } from 'react'
import type { TaskRecord } from '../../../shared/ipc'
import { formatCompactDate } from '../lib/date'

export function PlanningSection({
  planningDay,
  refreshSignal
}: {
  planningDay: string
  refreshSignal: number
}) {
  const [tasks, setTasks] = useState<TaskRecord[] | undefined>(undefined)
  const [text, setText] = useState('')

  useEffect(() => {
    let cancelled = false
    function load(): void {
      window.daylog.loadTasks(planningDay).then((result) => {
        if (!cancelled) setTasks(result)
      })
    }
    setTasks(undefined)
    load()
    const unsubscribe = window.daylog.onTasksChanged(({ affectedDate }) => {
      if (affectedDate === planningDay) load()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
    // refreshSignal bumps after a rollover carry adds a task for this day,
    // so this list picks it up without waiting on the broadcast round trip.
  }, [planningDay, refreshSignal])

  async function handleAdd(e: FormEvent): Promise<void> {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    const created = await window.daylog.addTask(planningDay, trimmed)
    setTasks((prev) => [...(prev ?? []), created])
  }

  async function handleDelete(taskId: number): Promise<void> {
    setTasks((prev) => prev?.filter((t) => t.id !== taskId))
    await window.daylog.deleteTask(taskId)
  }

  return (
    <div className="overlay-section planning-section">
      <h2 className="overlay-subheader">Planning — {formatCompactDate(planningDay)}</h2>
      <form className="planning-add-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="planning-input"
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="planning-add-btn" disabled={!text.trim()}>
          Add
        </button>
      </form>
      {tasks === undefined ? (
        <p className="sidebar-empty">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="sidebar-empty">Nothing planned yet.</p>
      ) : (
        <ul className="planning-items">
          {tasks.map((t) => (
            <li key={t.id} className="planning-item">
              <span className="planning-text">{t.text}</span>
              <button
                type="button"
                className="planning-delete-btn"
                onClick={() => handleDelete(t.id)}
                aria-label="Delete task"
                title="Delete task"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
