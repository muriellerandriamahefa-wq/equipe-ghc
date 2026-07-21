"use client"

import { useEffect, useMemo, useState } from "react"
import { PanelLeft, FileText } from "lucide-react"
import { KbSidebar } from "@/components/kb-sidebar"
import { NotePanel } from "@/components/note-panel"
import {
  allTags,
  createEmptyNote,
  loadNotes,
  matchesQuery,
  saveNotes,
  type Note,
} from "@/lib/notes"
import { cn } from "@/lib/utils"

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const initial = loadNotes()
    setNotes(initial)
    setSelectedId(initial[0]?.id ?? null)
    setLoaded(true)
  }, [])

  // Persist on every change (after initial load)
  useEffect(() => {
    if (loaded) saveNotes(notes)
  }, [notes, loaded])

  const tagList = useMemo(() => allTags(notes), [notes])

  const filtered = useMemo(() => {
    return notes
      .filter((n) => matchesQuery(n, search))
      .filter((n) => activeTags.every((t) => n.tags.includes(t)))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, search, activeTags])

  const selected = notes.find((n) => n.id === selectedId) ?? null

  function handleNew() {
    const note = createEmptyNote(selected?.theme || "Nouvelle thématique")
    setNotes((prev) => [note, ...prev])
    setSelectedId(note.id)
    setSidebarOpen(false)
  }

  function handlePatch(patch: Partial<Note>) {
    if (!selectedId) return
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    )
  }

  function handleDelete() {
    if (!selectedId) return
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== selectedId)
      setSelectedId(next[0]?.id ?? null)
      return next
    })
  }

  function handleToggleTag(tag: string) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    setSidebarOpen(false)
  }

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[300px] transition-transform md:static md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <KbSidebar
          notes={filtered}
          allTagList={tagList}
          selectedId={selectedId}
          search={search}
          activeTags={activeTags}
          onSearchChange={setSearch}
          onToggleTag={handleToggleTag}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
        />
      )}

      {/* Editor area */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="truncate font-serif font-semibold">
            {selected?.subtitle || selected?.theme || "Base de connaissances"}
          </span>
        </header>

        {selected ? (
          <NotePanel note={selected} onChange={handlePatch} onDelete={handleDelete} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Aucune note sélectionnée</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Créez une nouvelle note pour documenter un processus de traitement, ou choisissez-en une dans la liste.
            </p>
            <button
              type="button"
              onClick={handleNew}
              className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Créer ma première note
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
