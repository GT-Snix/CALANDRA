import { useEffect, useState } from 'react'
import { NoteEditor } from './editor/NoteEditor'
import { Sidebar } from './components/Sidebar'
import { formatDisplayDate, todayKey } from './lib/date'

export default function App() {
  const [today] = useState(todayKey)
  const [selectedDate, setSelectedDate] = useState(today)
  const [content, setContent] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setContent(undefined)
    window.daylog.loadNote(selectedDate).then((note) => {
      if (!cancelled) setContent(note.content)
    })
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  return (
    <div className="app-shell">
      <Sidebar today={today} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <main className="main-content">
        <header className="main-header">{formatDisplayDate(selectedDate)}</header>
        {content === undefined ? (
          <p className="loading">Loading…</p>
        ) : (
          <NoteEditor key={selectedDate} date={selectedDate} initialContent={content} />
        )}
      </main>
    </div>
  )
}
