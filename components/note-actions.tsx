"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreVertical, Download, Trash2, Edit2, FolderInput, FolderOpen } from "lucide-react"
import type { Folder } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExportDialog } from "@/components/export-dialog"
import { deleteNote } from "@/app/actions/delete-note"
import { renameNote } from "@/app/actions/rename-note"

interface NoteActionsProps {
  noteId: string
  currentTitle?: string
  showMoveToFolder?: boolean
}

export function NoteActions({ noteId, currentTitle = "", showMoveToFolder = true }: NoteActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(currentTitle)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const router = useRouter()

  useEffect(() => {
    if (showMoveToFolder) {
      // Fetch folders for move menu
      fetch('/api/folders/list')
        .then(res => res.json())
        .then(data => setFolders(data.folders || []))
        .catch(err => console.error('Failed to fetch folders:', err))
    }
  }, [showMoveToFolder])

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteNote(noteId)

    if (!result.error) {
      router.push("/vault")
      router.refresh()
    }

    setDeleting(false)
  }

  const handleRename = async () => {
    if (!newTitle.trim()) {
      setRenameError("Title cannot be empty")
      return
    }

    setRenaming(true)
    setRenameError(null)

    const result = await renameNote(noteId, newTitle)

    if (result.error) {
      setRenameError(result.error)
      setRenaming(false)
    } else {
      setShowRenameDialog(false)
      router.refresh()
      setRenaming(false)
    }
  }

  const handleOpenRenameDialog = () => {
    setNewTitle(currentTitle)
    setRenameError(null)
    setShowRenameDialog(true)
  }

  const handleMoveToFolder = async (folderId: string | null) => {
    try {
      const response = await fetch('/api/notes/move-to-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, folderId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to move note:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2" onClick={handleOpenRenameDialog}>
            <Edit2 className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
          {showMoveToFolder && folders.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <FolderInput className="h-4 w-4" />
                Move to Folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-[200px]" sideOffset={8} alignOffset={-4}>
                <DropdownMenuItem onClick={() => handleMoveToFolder(null)} className="gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uncategorized</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {folders.map(folder => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => handleMoveToFolder(folder.id)}
                    className="gap-2"
                  >
                    <span style={{ color: folder.color }}>{folder.icon}</span>
                    <span>{folder.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuItem className="gap-2" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4" />
            Export
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog noteId={noteId} open={showExportDialog} onOpenChange={setShowExportDialog} />

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Rehash</DialogTitle>
            <DialogDescription>
              Enter a new name for your rehash
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new title..."
                disabled={renaming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !renaming) {
                    handleRename()
                  }
                }}
                autoFocus
              />
            </div>
            {renameError && (
              <p className="text-sm text-destructive">{renameError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={renaming}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={renaming || !newTitle.trim()}>
              {renaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
