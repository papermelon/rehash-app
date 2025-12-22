"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, Check, FileText } from "lucide-react"
import { toast } from "sonner"
import { remark } from 'remark'
import remarkHtml from 'remark-html'

interface MarkdownNotesProps {
  notesMd: string
  title?: string
}

export function MarkdownNotes({ notesMd, title = "Study Notes" }: MarkdownNotesProps) {
  const [copied, setCopied] = useState(false)

  // Convert markdown to HTML
  const htmlContent = notesMd ? 
    (() => {
      try {
        // Type assertion needed: remark-html v15 types are incompatible with remark v15, but works at runtime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return remark()
          .use(remarkHtml as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .processSync(notesMd)
          .toString()
      } catch (error) {
        console.error('Markdown processing error:', error)
        return notesMd // Fallback to raw markdown
      }
    })() : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notesMd)
      setCopied(true)
      toast.success("Notes copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy notes")
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([notesMd], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Notes downloaded!")
    } catch {
      toast.error("Failed to download notes")
    }
  }

  if (!notesMd) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Study Notes
          </CardTitle>
          <CardDescription>
            Clean, structured notes will appear here after generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notes generated yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Study Notes
            </CardTitle>
            <CardDescription>
              AI-generated clean markdown notes from your uploaded content
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copied}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="whitespace-pre-wrap leading-relaxed"
          />
        </div>
        
        {/* Raw markdown preview for debugging */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            View raw markdown
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
            <code>{notesMd}</code>
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}
