import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthSyncProvider } from "@/components/auth-sync-provider"

export const metadata: Metadata = {
  title: "Rehash - Transform Notes into Knowledge",
  description: "Turn messy workshop notes into structured summaries and flashcards with AI",
  generator: "v0.app",
  icons: {
    icon: '/rehash-logo.png',
    apple: '/rehash-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthSyncProvider>{children}</AuthSyncProvider>
      </body>
    </html>
  )
}
