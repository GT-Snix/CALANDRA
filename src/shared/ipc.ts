// Single source of truth for IPC channel names, shared by the main process
// (registers ipcMain.handle for each) and the preload script (wraps each in
// a typed window.daylog.* method). Add one entry here per new operation —
// attachments, etc. will follow the same pattern.
export const IPC = {
  notesLoad: 'notes:load',
  notesSave: 'notes:save',
  tasksLoad: 'tasks:load',
  tasksToggleChecked: 'tasks:toggleChecked',
  tasksLoadUnresolvedForRollover: 'tasks:loadUnresolvedForRollover',
  tasksCarry: 'tasks:carry',
  tasksDrop: 'tasks:drop',
  tasksAdd: 'tasks:add',
  tasksDelete: 'tasks:delete',
  // Push channel (main -> all renderers), not an ipcMain.handle: broadcast
  // after every mutating task write so any window showing the affected
  // date can refetch, without polling.
  tasksChanged: 'tasks:changed',
  overlayResize: 'overlay:resize',
  shellOpenExternal: 'shell:openExternal'
} as const

export interface NoteRecord {
  date: string
  content: string | null
  updatedAt: string | null
}

export interface SaveNoteResult {
  updatedAt: string
}

export interface TaskRecord {
  id: number
  dayDate: string
  text: string
  isChecked: boolean
  isDropped: boolean
  rolledFromTaskId: number | null
  createdAt: string
}

export interface TasksChangedPayload {
  affectedDate: string
}
