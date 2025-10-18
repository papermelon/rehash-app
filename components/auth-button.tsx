"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function AuthButton() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (isMounted) {
        setEmail(data.user?.email ?? null)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (isMounted) {
        setEmail(session?.user?.email ?? null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setEmail(null)
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {email && (
        <span className="hidden text-sm text-muted-foreground sm:inline-block" data-testid="user-email">
          {email}
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
