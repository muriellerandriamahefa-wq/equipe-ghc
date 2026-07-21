export type Note = {
  id: string
  theme: string
  subtitle: string
  content: string // HTML from the rich text editor
  tags: string[]
  updatedAt: number
  createdAt: number
}

/**
 * Plain-text version of the HTML content, used for search and previews.
 * Deterministic (regex-based) so server and client render identically and
 * avoid hydration mismatches.
 */
export function contentToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

export function matchesQuery(note: Note, query: string): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    note.theme.toLowerCase().includes(q) ||
    note.subtitle.toLowerCase().includes(q) ||
    note.tags.some((t) => t.toLowerCase().includes(q)) ||
    contentToText(note.content).toLowerCase().includes(q)
  )
}

export function allTags(notes: Note[]): string[] {
  const set = new Set<string>()
  notes.forEach((n) => n.tags.forEach((t) => set.add(t)))
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"))
}
