"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getErrorMessage } from "@/lib/error-utils"
import { revalidatePath } from "next/cache"

export async function deleteNote(noteId: string) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Delete note (cascades to flashcards and tags)
    const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Delete error:", error)
      return { error: "Failed to delete note" }
    }

    revalidatePath("/vault")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete note error:", error)
    return { error: getErrorMessage(error, "Failed to delete note") }
  }
}
