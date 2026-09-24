import { BrowserWindow, ipcMain } from 'electron'
import { ensureDayExists, getDb } from '../../db'
import { IPC, type TaskRecord } from '../../shared/ipc'

interface TaskRow {
  id: number
  day_date: string
  text: string
  is_checked: number
  is_dropped: number
  rolled_from_task_id: number | null
  created_at: string
}

function toTaskRecord(row: TaskRow): TaskRecord {
  return {
    id: row.id,
    dayDate: row.day_date,
    text: row.text,
    isChecked: Boolean(row.is_checked),
    isDropped: Boolean(row.is_dropped),
    rolledFromTaskId: row.rolled_from_task_id,
    createdAt: row.created_at
  }
}

function getTaskRow(taskId: number): TaskRow {
  const row = getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as
    | TaskRow
    | undefined
  if (!row) throw new Error(`Task ${taskId} not found`)
  return row
}

// Pure 'YYYY-MM-DD' + 1 day arithmetic, done via Date.UTC so it can't be
// thrown off by local-timezone DST transitions (there's no time-of-day here,
// just calendar-day bookkeeping).
function addOneDayToDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + 1)
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Tells every open window "a task write touched this date" so whichever
// component is currently showing that date (sidebar, overlay day list,
// rollover, planning) can refetch instead of drifting out of sync.
function broadcastTasksChanged(affectedDate: string): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IPC.tasksChanged, { affectedDate })
  }
}

export function registerTasksIpc(): void {
  ipcMain.handle(IPC.tasksLoad, (_event, date: string): TaskRecord[] => {
    const db = getDb()
    const rows = db
      .prepare('SELECT * FROM tasks WHERE day_date = ? ORDER BY created_at ASC, id ASC')
      .all(date) as TaskRow[]
    return rows.map(toTaskRecord)
  })

  ipcMain.handle(IPC.tasksToggleChecked, (_event, taskId: number): TaskRecord => {
    const db = getDb()
    const row = getTaskRow(taskId)
    const nextChecked = row.is_checked ? 0 : 1
    db.prepare('UPDATE tasks SET is_checked = ? WHERE id = ?').run(nextChecked, taskId)
    broadcastTasksChanged(row.day_date)
    return toTaskRecord({ ...row, is_checked: nextChecked })
  })

  ipcMain.handle(IPC.tasksLoadUnresolvedForRollover, (_event, date: string): TaskRecord[] => {
    const db = getDb()
    const rows = db
      .prepare(
        `SELECT * FROM tasks
         WHERE day_date = ? AND is_checked = 0 AND is_dropped = 0
           AND id NOT IN (
             SELECT rolled_from_task_id FROM tasks WHERE rolled_from_task_id IS NOT NULL
           )
         ORDER BY created_at ASC, id ASC`
      )
      .all(date) as TaskRow[]
    return rows.map(toTaskRecord)
  })

  ipcMain.handle(IPC.tasksCarry, (_event, taskId: number): TaskRecord => {
    const db = getDb()
    const original = getTaskRow(taskId)
    const targetDate = addOneDayToDateKey(original.day_date)
    ensureDayExists(targetDate)

    const createdAt = new Date().toISOString()
    const info = db
      .prepare(
        `INSERT INTO tasks (day_date, text, is_checked, is_dropped, rolled_from_task_id, created_at)
         VALUES (?, ?, 0, 0, ?, ?)`
      )
      .run(targetDate, original.text, original.id, createdAt)

    // Two dates changed: the source (a task is now excluded from future
    // rollover queries) and the target (a new row exists there).
    broadcastTasksChanged(original.day_date)
    broadcastTasksChanged(targetDate)

    return toTaskRecord(getTaskRow(Number(info.lastInsertRowid)))
  })

  ipcMain.handle(IPC.tasksDrop, (_event, taskId: number): TaskRecord => {
    const db = getDb()
    const row = getTaskRow(taskId)
    db.prepare('UPDATE tasks SET is_dropped = 1 WHERE id = ?').run(taskId)
    broadcastTasksChanged(row.day_date)
    return toTaskRecord({ ...row, is_dropped: 1 })
  })

  ipcMain.handle(IPC.tasksAdd, (_event, date: string, text: string): TaskRecord => {
    const trimmed = text.trim()
    if (!trimmed) throw new Error('Task text cannot be empty')

    ensureDayExists(date)
    const db = getDb()
    const createdAt = new Date().toISOString()
    const info = db
      .prepare(
        `INSERT INTO tasks (day_date, text, is_checked, is_dropped, rolled_from_task_id, created_at)
         VALUES (?, ?, 0, 0, NULL, ?)`
      )
      .run(date, trimmed, createdAt)

    broadcastTasksChanged(date)
    return toTaskRecord(getTaskRow(Number(info.lastInsertRowid)))
  })

  ipcMain.handle(IPC.tasksDelete, (_event, taskId: number): void => {
    const row = getTaskRow(taskId)
    getDb().prepare('DELETE FROM tasks WHERE id = ?').run(taskId)
    broadcastTasksChanged(row.day_date)
  })
}
