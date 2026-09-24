import { ipcMain, shell } from 'electron'
import { IPC } from '../../shared/ipc'

export function registerShellIpc(): void {
  ipcMain.handle(IPC.shellOpenExternal, async (_event, url: string): Promise<void> => {
    if (!/^https?:\/\//i.test(url)) return
    await shell.openExternal(url)
  })
}
