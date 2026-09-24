export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS days (
  date TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_date TEXT NOT NULL REFERENCES days(date),
  content TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_date TEXT NOT NULL REFERENCES days(date),
  text TEXT NOT NULL,
  is_checked INTEGER NOT NULL DEFAULT 0,
  is_dropped INTEGER NOT NULL DEFAULT 0,
  rolled_from_task_id INTEGER REFERENCES tasks(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_date TEXT NOT NULL REFERENCES days(date),
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proof_of_work (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_date TEXT NOT NULL REFERENCES days(date),
  note_text TEXT,
  image_path TEXT,
  submitted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS popup_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('generic', 'personalized')),
  content TEXT NOT NULL,
  is_user_added INTEGER NOT NULL DEFAULT 0
);
`
