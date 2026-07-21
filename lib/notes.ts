export type Note = {
  id: string
  theme: string
  subtitle: string
  content: string // HTML from the rich text editor
  tags: string[]
  updatedAt: number
  createdAt: number
}

const STORAGE_KEY = "kb.notes.v1"

export function createEmptyNote(theme = "Nouvelle thématique"): Note {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    theme,
    subtitle: "",
    content: "",
    tags: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function loadNotes(): Note[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedNotes()
    const parsed = JSON.parse(raw) as Note[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveNotes(notes: Note[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // ignore quota / serialization errors
  }
}

/** Plain-text version of the HTML content, used for search. */
export function contentToText(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ")
  const el = document.createElement("div")
  el.innerHTML = html
  return el.textContent || ""
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

function seedNotes(): Note[] {
  const now = Date.now()
  return [
    {
      id: crypto.randomUUID(),
      theme: "Traitement des commandes",
      subtitle: "Vérification et validation quotidienne",
      content:
        "<h2>Objectif</h2><p>Traiter les commandes reçues avant midi et lever les blocages.</p><h3>Étapes</h3><ol><li>Ouvrir la file d'attente des commandes</li><li>Contrôler la disponibilité du stock</li><li>Valider le paiement</li><li>Générer le bon de préparation</li></ol><blockquote>Toujours vérifier les commandes marquées « urgent » en priorité.</blockquote>",
      tags: ["quotidien", "commandes", "logistique"],
      createdAt: now - 400000,
      updatedAt: now - 400000,
    },
    {
      id: crypto.randomUUID(),
      theme: "Traitement des commandes",
      subtitle: "Gestion des retours",
      content:
        "<h3>Procédure de retour</h3><ul><li>Vérifier l'état du produit</li><li>Enregistrer le motif</li><li>Émettre le remboursement ou l'échange</li></ul>",
      tags: ["commandes", "retours"],
      createdAt: now - 300000,
      updatedAt: now - 300000,
    },
    {
      id: crypto.randomUUID(),
      theme: "Support client",
      subtitle: "Réponses aux tickets prioritaires",
      content:
        "<h2>Tri des tickets</h2><p>Classer par niveau de priorité puis par date d'arrivée.</p><p>Utiliser les modèles de réponse validés pour gagner du temps.</p>",
      tags: ["quotidien", "support"],
      createdAt: now - 200000,
      updatedAt: now - 200000,
    },
  ]
}
