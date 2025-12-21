import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ImageIcon, FileType } from "lucide-react"
import type { Note, ViewMode, Folder } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { NoteActions } from "@/components/note-actions"

interface NoteCardProps {
  note: Note
  viewMode?: ViewMode
  folder?: Folder | null
  isVideoEssay?: boolean
}

export function NoteCard({ note, viewMode = 'grid', folder, isVideoEssay = false }: NoteCardProps) {
  const icon = note.type === "pdf" ? FileType : note.type === "image" ? ImageIcon : FileText
  const Icon = icon

  const summary =
    note.summary ||
    (note.notes_md ? `${note.notes_md.slice(0, 160)}${note.notes_md.length > 160 ? "…" : ""}` : "No summary available")

  // Use audio page for video essays, review page for regular notes
  const linkHref = isVideoEssay ? `/audio/${note.id}` : `/review/${note.id}`

  // Grid view (existing layout)
  if (viewMode === 'grid') {
    return (
      <Card className="relative h-full transition-all hover:border-primary/50 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Link href={linkHref} className="flex flex-1 items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="line-clamp-2 text-base">{note.title}</CardTitle>
            </Link>
            <NoteActions noteId={note.id} currentTitle={note.title} />
          </div>
          <CardDescription className="text-xs">
            {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
          </CardDescription>
          {folder && (
            <Badge variant="outline" className="gap-1.5 text-xs w-fit" style={{ borderColor: folder.color }}>
              <div 
                className="h-2 w-2 rounded-full shrink-0" 
                style={{ backgroundColor: folder.color }}
              />
              <span>{folder.icon}</span>
              {folder.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href={linkHref} className="block text-sm text-muted-foreground">
            <p className="line-clamp-3">{summary}</p>
          </Link>
          {note.auto_tags && note.auto_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.auto_tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.auto_tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{note.auto_tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // List view (horizontal compact layout)
  return (
    <Card className="transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-center gap-4 p-4">
        <div className="rounded-md bg-primary/10 p-3 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <Link href={linkHref} className="block">
            <CardTitle className="text-base hover:text-primary transition-colors line-clamp-1">
              {note.title}
            </CardTitle>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
            {folder && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <div 
                    className="h-2 w-2 rounded-full shrink-0" 
                    style={{ backgroundColor: folder.color }}
                  />
                  <span>{folder.icon}</span>
                  <span>{folder.name}</span>
                </span>
              </>
            )}
          </div>
          <Link href={linkHref} className="block">
            <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
          </Link>
          {note.auto_tags && note.auto_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {note.auto_tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.auto_tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{note.auto_tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
        <NoteActions noteId={note.id} currentTitle={note.title} />
      </div>
    </Card>
  )
}
