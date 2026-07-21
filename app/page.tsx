import { KbApp } from "@/components/kb-app"
import { getNotes } from "@/app/actions/notes"

export const dynamic = "force-dynamic"

export default async function Page() {
  const notes = await getNotes()
  return <KbApp initialNotes={notes} />
}
