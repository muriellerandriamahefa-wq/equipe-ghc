"use client"

import { useState } from "react"
import { Trash2, X, Tag as TagIcon } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"
import type { Note } from "@/lib/notes"

type Props = {
  note: Note
  onChange: (patch: Partial<Note>) => void
  onDelete: () => void
}

export function NotePanel({ note, onChange, onDelete }: Props) {
  const [tagDraft, setTagDraft] = useState("")

  function addTag() {
    const value = tagDraft.trim().toLowerCase()
    if (!value) return
    if (!note.tags.includes(value)) {
      onChange({ tags: [...note.tags, value] })
    }
    setTagDraft("")
  }

  function removeTag(tag: string) {
    onChange({ tags: note.tags.filter((t) => t !== tag) })
  }

  const updated = new Date(note.updatedAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto px-6 py-8 md:px-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Thématique
          </label>
          <input
            type="text"
            value={note.theme}
            onChange={(e) => onChange({ theme: e.target.value })}
            placeholder="Thématique"
            aria-label="Thématique"
            className="w-full border-none bg-transparent font-serif text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          title="Supprimer la note"
          aria-label="Supprimer la note"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sous-titre
        </label>
        <input
          type="text"
          value={note.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Sous-titre du processus"
          aria-label="Sous-titre"
          className="w-full border-b border-border bg-transparent pb-1.5 text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <TagIcon className="h-3.5 w-3.5" />
          Étiquettes
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Retirer l'étiquette ${tag}`}
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                addTag()
              } else if (e.key === "Backspace" && !tagDraft && note.tags.length) {
                removeTag(note.tags[note.tags.length - 1])
              }
            }}
            onBlur={addTag}
            placeholder="Ajouter une étiquette..."
            aria-label="Ajouter une étiquette"
            className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <RichTextEditor
        value={note.content}
        onChange={(html) => onChange({ content: html })}
        placeholder="Décrivez le processus étape par étape..."
      />

      <p className="mt-4 text-xs text-muted-foreground">Dernière modification : {updated}</p>
    </div>
  )
}
