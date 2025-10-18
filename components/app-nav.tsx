"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"
import { Plus, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppNav() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/vault') {
      return pathname === '/vault' || pathname?.startsWith('/review/') || pathname?.startsWith('/audio/')
    }
    return pathname?.startsWith(path)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <div className="relative w-5 h-5">
                <Image
                  src="/rehash-logo.png?v=2"
                  alt="Rehash"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              Rehash
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/upload">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "gap-2",
                    isActive('/upload') && "bg-muted text-foreground"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  New Rehash
                </Button>
              </Link>
              <Link href="/vault">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "gap-2",
                    isActive('/vault') && "bg-muted text-foreground"
                  )}
                >
                  <FolderOpen className="h-4 w-4" />
                  Vault
                </Button>
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

