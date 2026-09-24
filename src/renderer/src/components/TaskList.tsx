import { useEffect, useState } from 'react'
import type { TaskRecord } from '../../../shared/ipc'

export function TaskList({ date }: { date: string }) {
  const [tasks, setTasks] = useState<TaskRecord[] | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    function load(): void {
      window.daylog.loadTasks(date).then((result) => {
        if (!cancelled) setTasks(result)
      })
    }
    setTasks(undefined)
    load()
    const unsubscribe = window.daylog.onTasksChanged(({ affectedDate }) => {
      if (affectedDate === date) load()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [date])

  async function toggle(taskId: number): Promise<void> {
    setTasks((prev) =>
      prev?.map((t) => (t.id === taskId ? { ...t, isChecked: !t.isChecked } : t))
    )
    const updated = await window.daylog.toggleTaskChecked(taskId)
    setTasks((prev) => prev?.map((t) => (t.id === taskId ? updated : t)))
  }

  return (
    <div className="task-list">
      <h2 className="sidebar-section-title">Tasks</h2>
      {tasks === undefined ? (
        <p className="sidebar-empty">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="sidebar-empty">No tasks set for this day.</p>
      ) : (
        <ul className="task-items">
          {tasks.map((t) => (
            <li key={t.id} className={`task-item${t.isDropped ? ' task-item-dropped' : ''}`}>
              <label className="task-checkbox-label">
                <input
                  type="checkbox"
                  checked={t.isChecked}
                  disabled={t.isDropped}
                  onChange={() => toggle(t.id)}
                />
                <span className="task-text">{t.text}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
