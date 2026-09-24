import { ipcMain, type BrowserWindow } from 'electron'
import { IPC } from '../../shared/ipc'

const MIN_HEIGHT = 120
const MAX_HEIGHT = 640

export function registerOverlayIpc(getOverlayWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.overlayResize, (_event, height: number): void => {
    const win = getOverlayWindow()
    if (!win || win.isDestroyed()) return

    const clamped = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(height)))
    const bounds = win.getBounds()
    // setContentSize() reports success (getContentSize reflects the new
    // height immediately) but on this transparent, frameless macOS window
    // the renderer's own viewport (window.innerHeight) silently never
    // catches up after the first call or two — a real desync between the
    // native frame and the renderer's notion of its own size. setBounds()
    // doesn't have that problem; frame:false means bounds == content size
    // here (no title bar/border to account for).
    win.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: clamped })
  })
}
