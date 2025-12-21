import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase/server"
import { AppNav } from "@/components/app-nav"
import { VaultClient } from "./vault-client"
import type { Folder, ViewMode } from "@/lib/types"

interface VaultPageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function VaultPage({ searchParams }: VaultPageProps) {
  const { filter } = await searchParams
  const supabase = await getServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's notes
  const { data: allNotes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's folders
  const { data: folders, error: folderError } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("order_index", { ascending: true })

  // Log any folder errors for debugging
  if (folderError) {
    console.error('Folder fetch error:', folderError)
  }

  // Fetch user preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Filter based on query parameter
  let notes = allNotes || []
  const isVideoEssayFilter = filter === 'video-essays'
  
  if (isVideoEssayFilter && allNotes) {
    notes = allNotes.filter(note => 
      (note.script_text && note.script_text.trim().length > 0) || 
      (note.audio_url && note.audio_url.trim().length > 0)
    )
  }

  const initialViewMode: ViewMode = (preferences?.vault_view_mode as ViewMode) || 'grid'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppNav />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <VaultClient
          notes={notes}
          folders={(folders as Folder[]) || []}
          isVideoEssayFilter={isVideoEssayFilter}
          totalNotes={allNotes?.length || 0}
          initialViewMode={initialViewMode}
        />
      </main>
    </div>
  )
}
