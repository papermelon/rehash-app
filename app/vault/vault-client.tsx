"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NoteCard } from "@/components/note-card"
import { FolderDialog } from "@/components/folder-dialog"
import Link from "next/link"
import {
  Plus,
  FolderOpen,
  Mic,
  FolderPlus,
  Grid3x3,
  List,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
} from "lucide-react"
import type { Note, Folder, ViewMode } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface VaultClientProps {
  notes: Note[]
  folders: Folder[]
  isVideoEssayFilter: boolean
  totalNotes: number
  initialViewMode: ViewMode
}

interface SortableFolderItemProps {
  folder: Folder
  isExpanded: boolean
  folderNotes: Note[]
  viewMode: ViewMode
  isVideoEssay: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

function SortableFolderItem({
  folder,
  isExpanded,
  folderNotes,
  viewMode,
  isVideoEssay,
  onToggle,
  onEdit,
  onDelete,
}: SortableFolderItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-grab active:cursor-grabbing shrink-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Drag to reorder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Collapsible
          open={isExpanded}
          onOpenChange={onToggle}
          className="flex-1"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-auto py-2 hover:bg-muted w-full justify-start">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <div 
                className="h-3 w-3 rounded-full shrink-0" 
                style={{ backgroundColor: folder.color }}
              />
              <span className="text-xl">{isExpanded ? '📂' : '📁'}</span>
              <span className="font-semibold text-base">{folder.name}</span>
              <Badge variant="secondary" className="ml-1">
                {folderNotes.length}
              </Badge>
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          {folderNotes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No rehashes in this folder yet
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-3'
              }
            >
              {folderNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  folder={folder}
                  isVideoEssay={isVideoEssay}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function VaultClient({
  notes,
  folders: initialFolders,
  isVideoEssayFilter,
  totalNotes,
  initialViewMode,
}: VaultClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(initialFolders.map(f => f.id))
  )
  const [uncategorizedExpanded, setUncategorizedExpanded] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = folders.findIndex((f) => f.id === active.id)
      const newIndex = folders.findIndex((f) => f.id === over.id)

      const newFolders = arrayMove(folders, oldIndex, newIndex)
      setFolders(newFolders)

      // Save new order to backend
      try {
        await fetch('/api/folders/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderIds: newFolders.map((f: Folder) => f.id) }),
        })
      } catch (error) {
        console.error('Failed to reorder folders:', error)
        // Revert on error
        setFolders(initialFolders)
      }
    }
  }

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode)
    // Save to backend
    try {
      await fetch('/api/preferences/view-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewMode: mode }),
      })
    } catch (error) {
      console.error('Failed to save view mode:', error)
    }
  }

  const handleCreateFolder = async (name: string, color: string, icon: string) => {
    try {
      const response = await fetch('/api/folders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, icon }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const handleUpdateFolder = async (name: string, color: string, icon: string) => {
    if (!editingFolder) return

    try {
      const response = await fetch('/api/folders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: editingFolder.id, name, color, icon }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update folder:', error)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Notes inside will not be deleted.')) return

    try {
      const response = await fetch('/api/folders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to delete folder:', error)
    }
  }

  const videoEssayCount = notes.filter(
    n => (n.script_text && n.script_text.trim()) || (n.audio_url && n.audio_url.trim())
  ).length

  // Group notes by folder
  // When filtering for video essays, show all notes (ignore folder organization)
  const uncategorizedNotes = isVideoEssayFilter ? notes : notes.filter(n => !n.folder_id)
  const folderMap = new Map<string, Note[]>()
  
  if (!isVideoEssayFilter) {
    notes.forEach(note => {
      if (note.folder_id) {
        const existing = folderMap.get(note.folder_id) || []
        folderMap.set(note.folder_id, [...existing, note])
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              {isVideoEssayFilter ? (
                <>
                  <Mic className="h-8 w-8" />
                  Video Essays
                </>
              ) : (
                <>
                  <FolderOpen className="h-8 w-8" />
                  Your Vault
                </>
              )}
            </h2>
            <p className="text-muted-foreground">
              {isVideoEssayFilter
                ? 'All your video essay scripts and audio narrations'
                : 'All your rehashed study materials in one place'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isVideoEssayFilter && (
              <Button variant="outline" onClick={() => {
                setEditingFolder(null)
                setFolderDialogOpen(true)
              }}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            )}
            <Button asChild>
              <Link href="/upload" className="gap-2">
                <Plus className="h-4 w-4" />
                New Rehash
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter badges and view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Link href="/vault">
              <Badge
                variant={!isVideoEssayFilter ? 'default' : 'outline'}
                className="cursor-pointer gap-1 px-3 py-1"
              >
                <FolderOpen className="h-3 w-3" />
                All ({totalNotes})
              </Badge>
            </Link>
            <Link href="/vault?filter=video-essays">
              <Badge
                variant={isVideoEssayFilter ? 'default' : 'outline'}
                className="cursor-pointer gap-1 px-3 py-1"
              >
                <Mic className="h-3 w-3" />
                Video Essays ({videoEssayCount})
              </Badge>
            </Link>
          </div>

          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {notes.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {isVideoEssayFilter
              ? 'No video essays yet. Create a rehash and generate a video essay script to get started!'
              : 'No rehashes yet. Upload your first batch of files to get started!'}
          </p>
          <Button asChild className="mt-4">
            <Link href="/upload">Create Rehash</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders */}
          {!isVideoEssayFilter && folders.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={folders.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  {folders.map(folder => {
                    const folderNotes = folderMap.get(folder.id) || []
                    const isExpanded = expandedFolders.has(folder.id)

                    return (
                      <SortableFolderItem
                        key={folder.id}
                        folder={folder}
                        isExpanded={isExpanded}
                        folderNotes={folderNotes}
                        viewMode={viewMode}
                        isVideoEssay={isVideoEssayFilter}
                        onToggle={() => toggleFolder(folder.id)}
                        onEdit={() => {
                          setEditingFolder(folder)
                          setFolderDialogOpen(true)
                        }}
                        onDelete={() => handleDeleteFolder(folder.id)}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Uncategorized notes */}
          {uncategorizedNotes.length > 0 && (
            <div className="space-y-3">
              {!isVideoEssayFilter && folders.length > 0 ? (
                <Collapsible
                  open={uncategorizedExpanded}
                  onOpenChange={setUncategorizedExpanded}
                  className="space-y-3"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 h-auto py-2 hover:bg-muted">
                      {uncategorizedExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div 
                        className="h-3 w-3 rounded-full shrink-0 bg-muted-foreground/30" 
                      />
                      <span className="text-xl">{uncategorizedExpanded ? '📂' : '📁'}</span>
                      <span className="font-semibold text-base">Uncategorized</span>
                      <Badge variant="secondary" className="ml-1">
                        {uncategorizedNotes.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                          : 'space-y-3'
                      }
                    >
                      {uncategorizedNotes.map(note => (
                        <NoteCard key={note.id} note={note} viewMode={viewMode} isVideoEssay={isVideoEssayFilter} />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                      : 'space-y-3'
                  }
                >
                  {uncategorizedNotes.map(note => (
                    <NoteCard key={note.id} note={note} viewMode={viewMode} isVideoEssay={isVideoEssayFilter} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        folder={editingFolder}
        onSave={editingFolder ? handleUpdateFolder : handleCreateFolder}
      />
    </div>
  )
}

