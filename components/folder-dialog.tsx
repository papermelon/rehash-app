"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Folder } from "@/lib/types"

interface FolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder?: Folder | null
  onSave: (name: string, color: string, icon: string) => Promise<void>
}

const FOLDER_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

const FOLDER_ICONS = ['📁', '📂', '📚', '📖', '🗂️', '🗃️', '💼', '🎒', '🗄️', '📦']

export function FolderDialog({ open, onOpenChange, folder, onSave }: FolderDialogProps) {
  const [name, setName] = useState(folder?.name || '')
  const [color, setColor] = useState(folder?.color || '#6366f1')
  const [icon, setIcon] = useState(folder?.icon || '📁')
  const [isSaving, setIsSaving] = useState(false)

  // Sync state when folder prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(folder?.name || '')
      setColor(folder?.color || '#6366f1')
      setIcon(folder?.icon || '📁')
    }
  }, [open, folder])

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    try {
      await onSave(name.trim(), color, icon)
      onOpenChange(false)
      setName('')
      setColor('#6366f1')
      setIcon('📁')
    } catch (error) {
      console.error('Failed to save folder:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{folder ? 'Edit Folder' : 'Create New Folder'}</DialogTitle>
          <DialogDescription>
            {folder ? 'Update your folder details' : 'Create a new folder to organize your rehashes'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {FOLDER_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-3 text-2xl rounded border transition-colors ${
                    icon === emoji
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {FOLDER_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  className={`h-10 rounded border-2 transition-all ${
                    color === hex ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving...' : folder ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

