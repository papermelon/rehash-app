"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getErrorMessage } from "@/lib/error-utils"

export async function renameNote(noteId: string, newTitle: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors in server actions
            }
          },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    // Validate title
    if (!newTitle || newTitle.trim().length === 0) {
      return { error: "Title cannot be empty" }
    }

    if (newTitle.length > 200) {
      return { error: "Title is too long (max 200 characters)" }
    }

    // Update the note
    const { error: updateError } = await supabase
      .from("notes")
      .update({
        title: newTitle.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Failed to rename note:", updateError)
      return { error: "Failed to rename note" }
    }

    return { success: true }
  } catch (error) {
    console.error("Rename note error:", error)
    return { error: getErrorMessage(error, "Failed to rename note") }
  }
}
