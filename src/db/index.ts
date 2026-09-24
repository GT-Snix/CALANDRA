import path from 'node:path'
import Database from 'better-sqlite3'
import { app } from 'electron'
import { SCHEMA_SQL } from './schema'
import { seedPopupPresets } from './seed'

let db: Database.Database | null = null

export function getDbPath(): string {
  return path.join(app.getPath('userData'), 'daylog.db')
}

export function initDatabase(): Database.Database {
  if (db) return db

  const dbPath = getDbPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(SCHEMA_SQL)
  seedPopupPresets(db)

  return db
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

// Viewing/browsing a date must never create a `days` row — only a deliberate
// write (saving a note, adding/carrying a task) does. Call this before any
// such write that references day_date, since `tasks`/`notes` both have a
// foreign key on days(date) and inserts would otherwise fail for a date
// nobody has written to yet.
export function ensureDayExists(date: string): void {
  const database = getDb()
  const existing = database.prepare('SELECT 1 FROM days WHERE date = ?').get(date)
  if (!existing) {
    database
      .prepare('INSERT INTO days (date, created_at) VALUES (?, ?)')
      .run(date, new Date().toISOString())
  }
}
