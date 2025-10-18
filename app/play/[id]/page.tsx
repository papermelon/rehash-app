import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AuthButton } from "@/components/auth-button"
import { Button } from "@/components/ui/button"
import { InvaderGame } from "@/components/invader-game"
import Link from "next/link"
import { ArrowLeft, Gamepad2 } from "lucide-react"
import type { Note } from "@/lib/types"

interface PlayPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch note with game cards
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (noteError || !note) {
    notFound()
  }

  // Check if cards are available
  if (!note.cards_json || !note.cards_json.cards || note.cards_json.cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold">
              Rehash
            </Link>
            <AuthButton />
          </div>
        </header>

        <main className="container mx-auto max-w-4xl px-4 py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/review/${note.id}`} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Review
            </Link>
          </Button>

          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">No Game Cards Available</h2>
              <p className="text-muted-foreground">
                This note doesn't have any game cards generated yet.
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
      <header className="border-b">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Rehash
          </Link>
          <AuthButton />
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/review/${note.id}`} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </Link>
        </Button>

        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gamepad2 className="h-8 w-8" />
            {note.title} - Space Invaders Game
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with this interactive study game
          </p>
        </div>

        <InvaderGame cards={note.cards_json.cards} title={note.title} />
      </main>
    </div>
  )
}
