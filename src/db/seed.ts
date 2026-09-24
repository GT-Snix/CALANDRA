import type Database from 'better-sqlite3'

const GENERIC_PRESETS = [
  "Didn't get to this today — picking it up tomorrow.",
  'Blocked, will follow up.',
  'Done, nothing further needed.'
]

const PERSONALIZED_PRESETS = [
  'Still working through {task}, expect to finish by {eta}.',
  'Paused {task} to help with {other_task}.'
]

export function seedPopupPresets(db: Database.Database): void {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM popup_presets').get() as {
    count: number
  }
  if (count > 0) return

  const insert = db.prepare(
    'INSERT INTO popup_presets (type, content, is_user_added) VALUES (?, ?, 0)'
  )

  const seedAll = db.transaction(() => {
    for (const content of GENERIC_PRESETS) {
      insert.run('generic', content)
    }
    for (const content of PERSONALIZED_PRESETS) {
      insert.run('personalized', content)
    }
  })

  seedAll()
}
