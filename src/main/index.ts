import { app, BrowserWindow } from 'electron'
import { initDatabase, getDbPath } from '../db'
import { createMainWindow, createOverlayWindow, getOverlayWindow } from './windows'
import { registerNotesIpc } from './ipc/notes'
import { registerTasksIpc } from './ipc/tasks'
import { registerShellIpc } from './ipc/shell'
import { registerOverlayIpc } from './ipc/overlay'

app.setName('daylog')

function launchWindows(): void {
  const mainWindow = createMainWindow()
  // Both windows read a theme preference from localStorage on the same
  // origin. Creating the overlay window at the same time as the main window
  // races Chromium's per-origin storage-partition init on a cold app boot —
  // the overlay's read can land before the partition has loaded, silently
  // falling back to the default theme. Waiting for the main window to
  // finish loading first guarantees that partition is already warm.
  mainWindow.webContents.once('did-finish-load', () => {
    createOverlayWindow()
  })
}

app.whenReady().then(() => {
  initDatabase()
  console.log(`[daylog] database ready at ${getDbPath()}`)

  registerNotesIpc()
  registerTasksIpc()
  registerShellIpc()
  registerOverlayIpc(getOverlayWindow)

  launchWindows()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      launchWindows()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
