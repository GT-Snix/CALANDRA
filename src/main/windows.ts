import { BrowserWindow, screen } from 'electron'
import path from 'node:path'
import { is } from './env'

const PRELOAD_PATH = path.join(__dirname, '../preload/index.js')

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Daylog',
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  if (is.dev) {
    mainWindow.webContents.on('console-message', (event) => {
      console.log(`[renderer] ${event.message}`)
    })
  }

  return mainWindow
}

let overlayWindowRef: BrowserWindow | null = null

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindowRef
}

export function createOverlayWindow(): BrowserWindow {
  const { width } = screen.getPrimaryDisplay().workAreaSize

  const overlayWindow = new BrowserWindow({
    width: 320,
    // Starting height only — the renderer measures its own content via
    // ResizeObserver and calls overlay:resize to fit it exactly (see
    // OverlayView.tsx / ipc/overlay.ts). This is just what's on screen for
    // the brief moment before that first measurement lands.
    height: 200,
    x: width - 340,
    y: 40,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    hasShadow: true,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  overlayWindowRef = overlayWindow
  overlayWindow.on('closed', () => {
    overlayWindowRef = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay.html`)
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'))
  }

  return overlayWindow
}
