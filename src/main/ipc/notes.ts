import fs from 'node:fs'
import path from 'node:path'
import { app, ipcMain } from 'electron'
import { ensureDayExists, getDb } from '../../db'
import { IPC, type NoteRecord, type SaveNoteResult } from '../../shared/ipc'
import { tiptapDocToMarkdown, type TiptapNode } from '../../shared/tiptapMarkdown'

function getVaultDir(): string {
  // Sibling of daylog.db under userData — app.getAppPath() points inside the
  // read-only app.asar once packaged. Attachments will live in vault/attachments.
  return path.join(app.getPath('userData'), 'vault')
}

function writeMarkdownMirror(date: string, content: string): void {
  let doc: TiptapNode
  try {
    doc = JSON.parse(content)
  } catch {
    return
  }
  const markdown = tiptapDocToMarkdown(doc)
  const vaultDir = getVaultDir()
  fs.mkdirSync(vaultDir, { recursive: true })
  fs.writeFileSync(path.join(vaultDir, `${date}.md`), markdown, 'utf-8')
}

export function registerNotesIpc(): void {
  ipcMain.handle(IPC.notesLoad, (_event, date: string): NoteRecord => {
    // Viewing a date must never create a `days` row — only a real save does
    // (see ensureDayExists below). Otherwise browsing the calendar would
    // silently write rows for every empty day the user glances at.
    const db = getDb()
    const row = db
      .prepare(
        'SELECT content, updated_at as updatedAt FROM notes WHERE day_date = ? ORDER BY updated_at DESC LIMIT 1'
      )
      .get(date) as { content: string; updatedAt: string } | undefined

    return { date, content: row?.content ?? null, updatedAt: row?.updatedAt ?? null }
  })

  ipcMain.handle(
    IPC.notesSave,
    (_event, date: string, content: string): SaveNoteResult => {
      ensureDayExists(date)
      const db = getDb()
      const updatedAt = new Date().toISOString()

      const existing = db
        .prepare('SELECT id FROM notes WHERE day_date = ? ORDER BY updated_at DESC LIMIT 1')
        .get(date) as { id: number } | undefined

      if (existing) {
        db.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?').run(
          content,
          updatedAt,
          existing.id
        )
      } else {
        db.prepare(
          'INSERT INTO notes (day_date, content, updated_at) VALUES (?, ?, ?)'
        ).run(date, content, updatedAt)
      }

      writeMarkdownMirror(date, content)

      return { updatedAt }
    }
  )
}
