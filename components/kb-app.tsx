"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { PanelLeft, FileText, RefreshCw } from "lucide-react"
import { KbSidebar } from "@/components/kb-sidebar"
import { NotePanel } from "@/components/note-panel"
import { allTags, matchesQuery, type Note } from "@/lib/notes"
import { createNote, deleteNote, getNotes, updateNote } from "@/app/actions/notes"
import { cn } from "@/lib/utils"

type Patch = Partial<Pick<Note, "theme" | "subtitle" | "content" | "tags">>

export function KbApp({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes[0]?.id ?? null)
  const [search, setSearch] = useState("")
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Debounced writes per note id
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const pending = useRef<Map<string, Patch>>(new Map())

  const flush = useCallback((id: string) => {
    const patch = pending.current.get(id)
    if (!patch) return
    pending.current.delete(id)
    updateNote(id, patch).catch((err) => console.log("[v0] updateNote failed:", err))
  }, [])

  // Flush any pending writes when the tab is hidden/closed
  useEffect(() => {
    const handler = () => {
      timers.current.forEach((t) => clearTimeout(t))
      timers.current.clear()
      Array.from(pending.current.keys()).forEach(flush)
    }
    window.addEventListener("beforeunload", handler)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handler()
    })
    return () => window.removeEventListener("beforeunload", handler)
  }, [flush])

  const refresh = useCallback(() => {
    startTransition(async () => {
      const fresh = await getNotes()
      setNotes(fresh)
      setSelectedId((cur) => (cur && fresh.some((n) => n.id === cur) ? cur : (fresh[0]?.id ?? null)))
    })
  }, [])

  const tagList = useMemo(() => allTags(notes), [notes])

  const filtered = useMemo(() => {
    return notes
      .filter((n) => matchesQuery(n, search))
      .filter((n) => activeTags.every((t) => n.tags.includes(t)))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, search, activeTags])

  const selected = notes.find((n) => n.id === selectedId) ?? null

  async function handleNew() {
    const current = selected?.theme || "Nouvelle thématique"
    const note = await createNote(current)
    setNotes((prev) => [note, ...prev])
    setSelectedId(note.id)
    setSidebarOpen(false)
  }

  function handlePatch(patch: Patch) {
    if (!selectedId) return
    const id = selectedId
    // Optimistic local update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    )
    // Queue a debounced write, merging patches for the same note
    pending.current.set(id, { ...pending.current.get(id), ...patch })
    const existing = timers.current.get(id)
    if (existing) clearTimeout(existing)
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id)
        flush(id)
      }, 600),
    )
  }

  async function handleDelete() {
    if (!selectedId) return
    const id = selectedId
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    pending.current.delete(id)
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id)
      setSelectedId(next[0]?.id ?? null)
      return next
    })
    await deleteNote(id).catch((err) => console.log("[v0] deleteNote failed:", err))
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
          isRefreshing={isPending}
          onRefresh={refresh}
          onSearchChange={setSearch}
          onToggleTag={handleToggleTag}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
        />
      )}

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
            {selected?.subtitle || selected?.theme || "Equipe GHC"}
          </span>
          <button
            type="button"
            onClick={refresh}
            aria-label="Actualiser"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
          </button>
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
