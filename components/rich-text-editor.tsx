"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Eraser,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

type Command = {
  icon: React.ElementType
  label: string
  run: () => void
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  // Sync incoming value only when it differs from the DOM (e.g. switching notes)
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
    }
    setIsEmpty(el.textContent?.trim().length === 0)
  }, [value])

  const emit = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    setIsEmpty(el.textContent?.trim().length === 0)
    onChange(el.innerHTML)
  }, [onChange])

  const exec = useCallback(
    (command: string, arg?: string) => {
      editorRef.current?.focus()
      document.execCommand(command, false, arg)
      emit()
    },
    [emit],
  )

  const commands: Command[][] = [
    [
      { icon: Bold, label: "Gras", run: () => exec("bold") },
      { icon: Italic, label: "Italique", run: () => exec("italic") },
      { icon: Underline, label: "Souligné", run: () => exec("underline") },
    ],
    [
      { icon: Heading2, label: "Titre", run: () => exec("formatBlock", "h2") },
      { icon: Heading3, label: "Sous-titre", run: () => exec("formatBlock", "h3") },
    ],
    [
      { icon: List, label: "Liste à puces", run: () => exec("insertUnorderedList") },
      { icon: ListOrdered, label: "Liste numérotée", run: () => exec("insertOrderedList") },
      { icon: Quote, label: "Citation", run: () => exec("formatBlock", "blockquote") },
    ],
    [
      {
        icon: Link2,
        label: "Lien",
        run: () => {
          const url = window.prompt("URL du lien :", "https://")
          if (url) exec("createLink", url)
        },
      },
      { icon: Eraser, label: "Effacer la mise en forme", run: () => exec("removeFormat") },
    ],
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card/80 p-1.5 backdrop-blur">
        {commands.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <span className="mx-1 h-5 w-px bg-border" aria-hidden />}
            {group.map((cmd) => (
              <button
                key={cmd.label}
                type="button"
                title={cmd.label}
                aria-label={cmd.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={cmd.run}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <cmd.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ))}
      </div>

      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label="Contenu de la note"
        contentEditable
        suppressContentEditableWarning
        data-empty={isEmpty}
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        className={cn(
          "rich-content min-h-[320px] rounded-lg border border-border bg-card px-5 py-4 text-[0.95rem] text-card-foreground",
          "focus-within:border-ring",
        )}
      />
    </div>
  )
}
