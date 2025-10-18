import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AppNav } from "@/components/app-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mic, Download, Volume2, FileText } from "lucide-react"
import { AudioPageClient } from "./audio-page-client"
import type { Note } from "@/lib/types"

interface AudioPageProps {
  params: Promise<{ id: string }>
}

export default async function AudioPage({ params }: AudioPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch note with audio/script data
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (noteError || !note) {
    notFound()
  }

  // Check if audio or script is available
  const hasAudio = note.audio_url && note.audio_url.trim().length > 0
  const hasScript = note.script_text && note.script_text.trim().length > 0
  const hasNotes = note.notes_md && note.notes_md.trim().length > 0

  if (!hasAudio && !hasScript && !hasNotes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <AppNav />

        <main className="container mx-auto max-w-4xl px-4 py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/review/${note.id}`} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Review
            </Link>
          </Button>

          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Mic className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">No Video Essay Content Available</h2>
              <p className="text-muted-foreground">
                This note doesn't have any video essay script or audio generated yet.
              </p>
              <Button asChild>
                <Link href={`/review/${note.id}`}>
                  Back to Review
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppNav />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/review/${note.id}`} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </Link>
        </Button>

        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic className="h-8 w-8" />
            {note.title} - Video Essay Creator
          </h1>
          <p className="text-muted-foreground">
            Transform your notes into engaging video essays with AI-powered scripts, narration, and visuals
          </p>
        </div>

        <AudioPageClient 
          note={note}
          hasAudio={hasAudio}
          hasScript={hasScript}
          hasNotes={hasNotes}
        />
      </main>
    </div>
  )
}

