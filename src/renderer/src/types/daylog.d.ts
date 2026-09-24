import type {
  NoteRecord,
  SaveNoteResult,
  TaskRecord,
  TasksChangedPayload
} from '../../../shared/ipc'

export {}

declare global {
  interface Window {
    daylog: {
      loadNote: (date: string) => Promise<NoteRecord>
      saveNote: (date: string, content: string) => Promise<SaveNoteResult>
      loadTasks: (date: string) => Promise<TaskRecord[]>
      toggleTaskChecked: (taskId: number) => Promise<TaskRecord>
      loadUnresolvedForRollover: (date: string) => Promise<TaskRecord[]>
      carryTask: (taskId: number) => Promise<TaskRecord>
      dropTask: (taskId: number) => Promise<TaskRecord>
      addTask: (date: string, text: string) => Promise<TaskRecord>
      deleteTask: (taskId: number) => Promise<void>
      onTasksChanged: (callback: (payload: TasksChangedPayload) => void) => () => void
      resizeOverlay: (height: number) => Promise<void>
      openExternal: (url: string) => Promise<void>
    }
  }
}
