"use client"

import { useMemo } from "react"
import { Search, Plus, BookOpen, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { contentToText, type Note } from "@/lib/notes"

type Props = {
  notes: Note[]
  allTagList: string[]
  selectedId: string | null
  search: string
  activeTags: string[]
  onSearchChange: (value: string) => void
  onToggleTag: (tag: string) => void
  onSelect: (id: string) => void
  onNew: () => void
}

export function KbSidebar({
  notes,
  allTagList,
  selectedId,
  search,
  activeTags,
  onSearchChange,
  onToggleTag,
  onSelect,
  onNew,
}: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, Note[]>()
    for (const note of notes) {
      const key = note.theme.trim() || "Sans thématique"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(note)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "fr"))
  }, [notes])

  return (
    <aside className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-serif text-base font-semibold text-sidebar-foreground">Base de connaissances</h1>
          <p className="truncate text-xs text-muted-foreground">Mes processus de traitement</p>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouvelle note
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher..."
            aria-label="Rechercher dans les notes"
            className="w-full rounded-lg border border-sidebar-border bg-card py-2 pl-9 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {allTagList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 py-3">
          {allTagList.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-sidebar-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {grouped.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">Aucune note trouvée.</p>
        ) : (
          grouped.map(([theme, themeNotes]) => (
            <div key={theme} className="mb-4">
              <h2 className="px-2 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {theme}
              </h2>
              <ul className="flex flex-col gap-1">
                {themeNotes.map((note) => {
                  const preview = contentToText(note.content).slice(0, 70)
                  const selected = note.id === selectedId
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(note.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                          selected
                            ? "border-primary/40 bg-accent"
                            : "border-transparent hover:bg-sidebar-accent",
                        )}
                      >
                        <p className="truncate text-sm font-medium text-foreground">
                          {note.subtitle.trim() || "Sans titre"}
                        </p>
                        {preview && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{preview}</p>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
