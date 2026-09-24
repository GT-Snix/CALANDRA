# Daylog

A local-only daily notes app with an accountability layer built in. Electron + SQLite + TipTap. Single-user by design, no cloud, no accounts, no sync.

Every day gets a note. Every night at 22:47, a floating overlay switches from showing today's tasks to asking what tomorrow's are — forcing an explicit carry/drop decision on anything left unresolved, instead of letting it silently disappear.

## Architecture

| Layer | Choice | Reason |
|---|---|---|
| Shell | Electron + electron-vite + TypeScript | Two windows, one codebase |
| Storage | SQLite via better-sqlite3 | Single-file, synchronous, inspectable with any SQLite browser, no server process |
| Editor | TipTap (ProseMirror) | Rich text with clean markdown export, supports custom embed nodes |
| Markdown mirror | Custom serializer, DB → `.md`, one-way | Keeps a human-readable, portable copy of every note outside the DB |

Two `BrowserWindow` instances (main window, overlay), one shared SQLite DB, a flat IPC contract between them — one `ipcMain.handle` per operation, no generic RPC layer.

## Features

### Editor
- Bold / italic / underline / strikethrough / ordered & unordered lists / code blocks
- YouTube links auto-convert to a clickable thumbnail embed; opens in the system browser, never in-app
- Autosaves 1s after the last edit, flushes immediately on blur
- Every save writes both the SQLite row and a mirrored `.md` file in the vault

### Vault
- `~/Library/Application Support/daylog/vault/` — one markdown file per day
- SQLite DB lives alongside it at `~/Library/Application Support/daylog/daylog.db` — open directly with `sqlite3` or any SQLite browser, no dedicated app required
- DB is the source of truth; the vault is a read-friendly mirror, not the other way around

### Main window sidebar
- Month-grid calendar, click any date to load that day's note
- Viewing an empty day does not create a DB row — only saving content does
- Task list for the selected day: view and check-off only. No add/edit/delete here — see overlay below for why

### Overlay
Always-on-top (`setAlwaysOnTop(true, 'floating')` + `setVisibleOnAllWorkspaces`), so it stays visible above other apps, including fullscreen ones. Behavior depends on time of day:

- **06:00–22:46 (day mode):** today's tasks, check-off only, no way to add new ones
- **22:47–05:59 (night mode):** two sections —
  - **Rollover** — anything left unresolved from the ending day is listed explicitly; each task is either carried forward or dropped, nothing expires silently
  - **Planning** — the only place new tasks get created, for the next day

The mode boundary is midnight-aware: 1:21 AM still resolves as part of the previous night's session (rollover targets *yesterday*, not an empty "today"), not a fresh day.

### Live sync
Every task mutation (check, carry, drop, add, delete) broadcasts to all open windows via IPC, so the sidebar and overlay never disagree about task state. Updates propagate in roughly a second, no manual reload.

### Theming
Manual light/dark toggle, independent of macOS's system appearance setting. Persists across restarts via localStorage.

### Packaging
Builds as a standalone, unsigned `.app` via electron-builder (no Apple Developer account required — expect one Gatekeeper "unidentified developer" prompt on first launch, bypassed with right-click → Open).

## Database schema

```
days              one row per day with a note or tasks
  date            PK, 'YYYY-MM-DD'
  created_at

notes
  id              PK
  day_date        FK -> days.date
  content         TipTap JSON, stored as text
  updated_at

tasks
  id              PK
  day_date        FK -> days.date (the day the task is FOR)
  text
  is_checked
  is_dropped
  rolled_from_task_id   nullable FK -> tasks.id, set when carried forward
  created_at

attachments       reserved for proof-of-work images (not yet built)
proof_of_work     reserved for the quit-gate feature (not yet built)
popup_presets     reserved for quit-gate messaging (not yet built)
```

## IPC surface

```
loadNote(date) / saveNote(date, content)
loadTasks(date) / toggleTaskChecked(taskId)
loadUnresolvedForRollover(date) / carryTask(taskId) / dropTask(taskId)
addTask(date, text) / deleteTask(taskId)
onTasksChanged(callback)     live-sync broadcast listener
openExternal(url)
```

## Known issues and gotchas

- **macOS's case-insensitive filesystem** will silently collide `Overlay.tsx` and `overlay.tsx` into one file. Keep filenames unambiguous.
- **`BrowserWindow.setContentSize()` desyncs from the renderer's `window.innerHeight`** on transparent, frameless windows after repeated calls. Use `setBounds()` instead.
- **`app.getAppPath()` resolves to a read-only path in packaged builds.** Anything that writes to disk (vault, attachments) must use `app.getPath('userData')`.
- The night-mode boundary needs two edges (22:47 and 06:00), not one — a single threshold flips back to day mode the instant the clock crosses midnight, which breaks rollover for anything used past midnight.

## Roadmap

**Scoped, not yet built**
- Quit-gate: intercept app close, require a note or photo (honor-system, unvalidated) before allowing quit
- Popup system: generic + personalized message pools, user-extensible, personalized variant only fires when there's a real unresolved commitment to reference
- Promise-integrity score: rolling ratio of completed vs. dropped tasks over time — a trust metric, not XP/levels

**Plausible next steps**
- Heatmap calendar view, colored by daily promise-integrity score
- Full-text search over notes (SQLite FTS5)
- Weekly review auto-generation from the week's notes and task data
- Tags / backlinks, if the flat daily-note structure stops being enough

**Larger scope, separate projects**
- Activity tracking via macOS Accessibility APIs (real permission flow, own project phase)
- Local LLM-graded proof-of-work (Ollama or similar) instead of honor-system quit-gate
- SelfControl integration for actual unbypassable-by-the-user session locks
- Encrypted local backup/export
