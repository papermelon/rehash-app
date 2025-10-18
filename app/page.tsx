import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, BookOpen, Mic, FolderOpen } from "lucide-react"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <section className="container flex flex-col items-center justify-center gap-8 px-4 py-8 md:py-12">
          <div className="flex max-w-4xl flex-col items-center gap-8 text-center">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
                <Image
                  src="/rehash-logo.png"
                  alt="REHASH Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                REHASH
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>People need to be reminded, not taught</span>
            </div>

            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Turn <span className="text-primary">forgotten notes</span> into <span className="text-primary">knowledge you remember</span>
            </h2>

            <p className="text-pretty text-lg text-muted-foreground sm:text-xl max-w-3xl">
              Stop letting your best insights gather digital dust. Rehash transforms your images, docs, and scattered thoughts into video essays, audio narrations, and interactive flashcards—so you actually revisit what matters.
            </p>

            <p className="text-base text-muted-foreground/80 italic max-w-2xl">
              Your antidote to doomscrolling. Turn learning into a cycle, not a one-time event.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              {user ? (
                <>
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/upload">
                      Create New Rehash
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="gap-2">
                    <Link href="/vault">
                      <FolderOpen className="h-4 w-4" />
                      Go to Vault
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Use Cases / How it works */}
          <div className="mt-16 w-full max-w-4xl">
            <h3 className="text-2xl font-bold text-center mb-8">Use it however you learn best</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card/50 p-5 space-y-2">
                <div className="font-medium">📚 For Students</div>
                <p className="text-sm text-muted-foreground">
                  Turn lecture slides and textbook photos into flashcards and video summaries. Study smarter, not harder.
                </p>
              </div>
              <div className="rounded-lg border bg-card/50 p-5 space-y-2">
                <div className="font-medium">🎯 For Lifelong Learners</div>
                <p className="text-sm text-muted-foreground">
                  That article you saved? Those podcast notes? Transform them into something you&apos;ll actually revisit.
                </p>
              </div>
              <div className="rounded-lg border bg-card/50 p-5 space-y-2">
                <div className="font-medium">💡 For Knowledge Workers</div>
                <p className="text-sm text-muted-foreground">
                  Meeting notes, brainstorms, whiteboards. Turn scattered ideas into organized, actionable content.
                </p>
              </div>
              <div className="rounded-lg border bg-card/50 p-5 space-y-2">
                <div className="font-medium">🎨 For Creators</div>
                <p className="text-sm text-muted-foreground">
                  Research becomes Reddit threads. Outlines become narrated video essays. Content creation, simplified.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid w-full max-w-5xl gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Dump everything in</h3>
              <p className="text-sm text-muted-foreground">
                Screenshots, lecture notes, random thoughts. Drop in up to 20 images and documents. We&apos;ll make sense of it all.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Learn in your favorite format</h3>
              <p className="text-sm text-muted-foreground">
                Clean notes, Reddit-style discussions, or quiz yourself with flashcards. Study the way that actually works for you.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Turn notes into video essays</h3>
              <p className="text-sm text-muted-foreground">
                AI writes the script, narrates it, and generates visuals. Your notes become something you&apos;ll actually want to watch.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 mb-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">Stop collecting notes. Start remembering them.</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join learners who are turning forgotten notes into knowledge they actually use.
            </p>
            {!user && (
              <Button asChild size="lg" className="gap-2 mt-4">
                <Link href="/signup">
                  Try Rehash Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-6 px-4 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <Image
                  src="/rehash-logo.png"
                  alt="REHASH"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="font-semibold">Rehash</p>
            </div>
            <p className="text-xs text-muted-foreground">Your antidote to doomscrolling</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p className="text-xs text-muted-foreground">Built with Next.js, Supabase, and AI</p>
            <p className="text-xs text-muted-foreground">Made for learners who want to remember</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
