"use server"

import { db } from "@/lib/db"
import { notes } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { Note } from "@/lib/notes"

function serialize(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    theme: row.theme,
    subtitle: row.subtitle,
    content: row.content,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  }
}

export async function getNotes(): Promise<Note[]> {
  const rows = await db.select().from(notes).orderBy(desc(notes.updatedAt))
  return rows.map(serialize)
}

export async function createNote(theme: string): Promise<Note> {
  const [row] = await db
    .insert(notes)
    .values({ theme: theme || "Nouvelle thématique" })
    .returning()
  revalidatePath("/")
  return serialize(row)
}

export async function updateNote(
  id: string,
  patch: { theme?: string; subtitle?: string; content?: string; tags?: string[] },
): Promise<void> {
  await db
    .update(notes)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(notes.id, id))
  revalidatePath("/")
}

export async function deleteNote(id: string): Promise<void> {
  await db.delete(notes).where(eq(notes.id, id))
  revalidatePath("/")
}
