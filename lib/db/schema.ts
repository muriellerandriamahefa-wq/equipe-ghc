import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  theme: text("theme").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  content: text("content").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type NoteRow = typeof notes.$inferSelect
