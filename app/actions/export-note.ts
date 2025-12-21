"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getErrorMessage } from "@/lib/error-utils"

export type ExportFormat = "markdown" | "csv"

export async function exportNote(noteId: string, format: ExportFormat) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Fetch note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single()

    if (noteError || !note) {
      return { error: "Note not found" }
    }

    // Fetch flashcards
    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("*")
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .order("order_index", { ascending: true })

    if (format === "markdown") {
      // Generate Markdown export
      let markdown = `# ${note.title}\n\n`

      if (note.auto_tags && note.auto_tags.length > 0) {
        markdown += `**Tags:** ${note.auto_tags.join(", ")}\n\n`
      }

      markdown += `**Created:** ${new Date(note.created_at).toLocaleDateString()}\n\n`
      markdown += `---\n\n`
      markdown += `## Summary\n\n${note.summary}\n\n`

      if (flashcards && flashcards.length > 0) {
        markdown += `---\n\n## Flashcards\n\n`
        flashcards.forEach((card, index) => {
          markdown += `### ${index + 1}. ${card.question}\n\n`
          markdown += `**Answer:** ${card.answer}\n\n`
        })
      }

      return {
        content: markdown,
        filename: `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`,
        mimeType: "text/markdown",
      }
    } else if (format === "csv") {
      // Generate CSV export for flashcards
      if (!flashcards || flashcards.length === 0) {
        return { error: "No flashcards to export" }
      }

      let csv = "Question,Answer\n"
      flashcards.forEach((card) => {
        // Escape quotes and wrap in quotes
        const question = `"${card.question.replace(/"/g, '""')}"`
        const answer = `"${card.answer.replace(/"/g, '""')}"`
        csv += `${question},${answer}\n`
      })

      return {
        content: csv,
        filename: `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_flashcards.csv`,
        mimeType: "text/csv",
      }
    }

    return { error: "Invalid format" }
  } catch (error) {
    console.error("[v0] Export error:", error)
    return { error: getErrorMessage(error, "Failed to export note") }
  }
}
