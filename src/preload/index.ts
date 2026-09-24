import { contextBridge, ipcRenderer } from 'electron'
import {
  IPC,
  type NoteRecord,
  type SaveNoteResult,
  type TaskRecord,
  type TasksChangedPayload
} from '../shared/ipc'

// One thin wrapper per IPC channel. Keep this pattern (not a generic RPC
// proxy) so each new domain — attachments, etc. — just adds a method here
// plus a matching ipcMain.handle in src/main/ipc/.
const daylogApi = {
  loadNote: (date: string): Promise<NoteRecord> => ipcRenderer.invoke(IPC.notesLoad, date),
  saveNote: (date: string, content: string): Promise<SaveNoteResult> =>
    ipcRenderer.invoke(IPC.notesSave, date, content),
  loadTasks: (date: string): Promise<TaskRecord[]> => ipcRenderer.invoke(IPC.tasksLoad, date),
  toggleTaskChecked: (taskId: number): Promise<TaskRecord> =>
    ipcRenderer.invoke(IPC.tasksToggleChecked, taskId),
  loadUnresolvedForRollover: (date: string): Promise<TaskRecord[]> =>
    ipcRenderer.invoke(IPC.tasksLoadUnresolvedForRollover, date),
  carryTask: (taskId: number): Promise<TaskRecord> => ipcRenderer.invoke(IPC.tasksCarry, taskId),
  dropTask: (taskId: number): Promise<TaskRecord> => ipcRenderer.invoke(IPC.tasksDrop, taskId),
  addTask: (date: string, text: string): Promise<TaskRecord> =>
    ipcRenderer.invoke(IPC.tasksAdd, date, text),
  deleteTask: (taskId: number): Promise<void> => ipcRenderer.invoke(IPC.tasksDelete, taskId),
  onTasksChanged: (callback: (payload: TasksChangedPayload) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: TasksChangedPayload): void =>
      callback(payload)
    ipcRenderer.on(IPC.tasksChanged, listener)
    return () => ipcRenderer.removeListener(IPC.tasksChanged, listener)
  },
  resizeOverlay: (height: number): Promise<void> => ipcRenderer.invoke(IPC.overlayResize, height),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.shellOpenExternal, url)
}

contextBridge.exposeInMainWorld('daylog', daylogApi)

export type DaylogApi = typeof daylogApi
