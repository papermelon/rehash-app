import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AppNav } from "@/components/app-nav"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MarkdownNotes } from "@/components/markdown-notes"
import { RedditThread } from "@/components/reddit-thread"
import { FlashcardView } from "@/components/flashcard-view"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, MessageCircle, HelpCircle, Mic } from "lucide-react"
import { format } from "date-fns"

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch note with all generated outputs
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (noteError || !note) {
    notFound()
  }

  // Check what outputs are available
  const hasNotes = note.notes_md && note.notes_md.trim().length > 0
  const hasReddit = note.reddit_json && Object.keys(note.reddit_json).length > 0
  const hasCards = note.cards_json && note.cards_json.cards && note.cards_json.cards.length > 0
  const hasAudio = note.audio_url && note.audio_url.trim().length > 0
  const hasScript = note.script_text && note.script_text.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppNav />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/vault" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Vault
          </Link>
        </Button>

        {/* Note Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{note.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(note.created_at), "PPP")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {(hasAudio || hasScript || hasNotes) && (
                <Button asChild variant="default" className="gap-2">
                  <Link href={`/audio/${note.id}`}>
                    <Mic className="h-4 w-4" />
                    Video Essay Creator
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Available Outputs */}
          <div className="flex flex-wrap gap-2">
            {hasNotes && (
              <Badge variant="secondary" className="gap-1">
                <FileText className="h-3 w-3" />
                Notes
              </Badge>
            )}
            {hasReddit && (
              <Badge variant="secondary" className="gap-1">
                <MessageCircle className="h-3 w-3" />
                Reddit Thread
              </Badge>
            )}
            {hasCards && (
              <Badge variant="secondary" className="gap-1">
                <HelpCircle className="h-3 w-3" />
                Flashcards
              </Badge>
            )}
            {(hasAudio || hasScript) && (
              <Badge variant="default" className="gap-1">
                <Mic className="h-3 w-3" />
                Video Essay Available
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes" className="gap-2" disabled={!hasNotes}>
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="reddit" className="gap-2" disabled={!hasReddit}>
              <MessageCircle className="h-4 w-4" />
              Reddit Thread
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="gap-2" disabled={!hasCards}>
              <HelpCircle className="h-4 w-4" />
              Flashcards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            {hasNotes ? (
              <MarkdownNotes notesMd={note.notes_md} title={note.title} />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notes generated yet</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reddit" className="mt-6">
            {hasReddit ? (
              <RedditThread redditJson={note.reddit_json} title={note.title} />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Reddit thread generated yet</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="flashcards" className="mt-6">
            {hasCards ? (
              <FlashcardView cardsJson={note.cards_json} title={note.title} />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No flashcards generated yet</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Original Content Preview */}
        {note.original_file_url && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Original Files</h2>
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Your uploaded content that was processed
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Type:</strong> {note.type}
                </p>
                {note.original_filename && (
                  <p className="text-sm">
                    <strong>Filename:</strong> {note.original_filename}
                  </p>
                )}
                {note.file_size && (
                  <p className="text-sm">
                    <strong>Size:</strong> {((note.file_size || 0) / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
