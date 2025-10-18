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
              <span>Transform notes into knowledge</span>
            </div>

            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Turn Images & Docs into Memorable Notes
            </h2>

            <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
              Upload multiple images, DOCX files, or raw text, add annotations, and get engaging study outputs: clean notes, Reddit-style discussions, audio narration, and study scripts.
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

          {/* Features */}
          <div className="mt-8 grid w-full max-w-5xl gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Multi-File Upload</h3>
              <p className="text-sm text-muted-foreground">
                Upload up to 20 images plus one DOCX/TXT file. HEIC images are automatically converted for preview.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Engaging Outputs</h3>
              <p className="text-sm text-muted-foreground">
                Get clean markdown notes, Reddit-style discussions, and interactive flashcards.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Video Essay Creator</h3>
              <p className="text-sm text-muted-foreground">
                Transform your notes into engaging video essays with AI-generated scripts, narration, and visuals!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">Built with Next.js, Supabase, and OpenAI</p>
          <p className="text-sm text-muted-foreground">Rehash - Knowledge Processing</p>
        </div>
      </footer>
    </div>
  )
}
