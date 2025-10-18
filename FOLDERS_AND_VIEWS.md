# Folders & View Modes - Organization & Display Features

## Overview

Two major UX enhancements for organizing and viewing your rehashes:
1. **Folder Organization** - Create folders/groups to organize related rehashes
2. **View Mode Toggle** - Switch between grid (icon) and list views

## Features Implemented

### 1. Folder Organization

Create custom folders to organize your rehashes by topic, project, or any categorization you prefer.

#### Folder Features:
- **Custom Names** - Name your folders anything you want
- **Custom Colors** - Choose from 10 colors for visual organization
- **Custom Icons** - Pick from 10 folder emojis
- **Collapsible Sections** - Expand/collapse folders to manage space
- **Move Notes** - Easily move notes between folders via dropdown menu
- **Uncategorized Section** - Notes without folders stay in "Uncategorized"

#### Folder Operations:
- **Create** - "New Folder" button in vault header
- **Edit** - Update name, color, or icon via folder menu (⋮)
- **Delete** - Remove folders (notes inside are not deleted, moved to uncategorized)
- **Move Notes** - Each note has "Move to Folder" option in actions menu (⋮)

### 2. View Mode Toggle

Switch between two viewing layouts for your rehashes:

**Grid View** (Default):
- Card-based layout with 3 columns
- Vertical cards showing note details
- Good for visual browsing
- Shows more content per note

**List View**:
- Horizontal compact layout
- One note per row
- Good for scanning many notes quickly
- More notes visible at once

View mode preference is saved to your account and persists across sessions.

## Database Schema

### New Tables

#### `folders`
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- name: TEXT (folder name)
- color: TEXT (hex color code, default #6366f1)
- icon: TEXT (emoji icon, default 📁)
- order_index: INTEGER (display order)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `user_preferences`
```sql
- user_id: UUID (primary key, references auth.users)
- vault_view_mode: TEXT ('grid' or 'list', default 'grid')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Updated Tables

#### `notes`
```sql
+ folder_id: UUID (nullable, references folders.id)
```

## Migration

Run the database migration to add these features:

```bash
# File: scripts/09-add-folders-and-view-preferences.sql
```

This creates:
- `folders` table with RLS policies
- `user_preferences` table with RLS policies
- `folder_id` column in `notes` table
- Appropriate indexes for performance

## API Routes

### Folder Management

**Create Folder**
```
POST /api/folders/create
Body: { name: string, color?: string, icon?: string }
```

**Update Folder**
```
POST /api/folders/update
Body: { folderId: string, name?: string, color?: string, icon?: string }
```

**Delete Folder**
```
POST /api/folders/delete
Body: { folderId: string }
```

**List Folders**
```
GET /api/folders/list
Returns: { folders: Folder[] }
```

### Note Operations

**Move Note to Folder**
```
POST /api/notes/move-to-folder
Body: { noteId: string, folderId: string | null }
```
(folderId = null moves to uncategorized)

### User Preferences

**Save View Mode**
```
POST /api/preferences/view-mode
Body: { viewMode: 'grid' | 'list' }
```

## Components

### New Components

**`components/folder-dialog.tsx`**
- Modal for creating/editing folders
- Name input
- Icon picker (10 options)
- Color picker (10 options)
- Save/Cancel actions

**`app/vault/vault-client.tsx`**
- Main vault client component
- Handles all folder and view state
- Folder creation/editing/deletion
- View mode toggle
- Folder expansion/collapse
- Note grouping by folder

### Updated Components

**`components/note-card.tsx`**
- Now supports `viewMode` prop ('grid' | 'list')
- Grid view: Original vertical card layout
- List view: New horizontal compact layout
- Shows folder badge/name when assigned to folder

**`components/note-actions.tsx`**
- Added "Move to Folder" submenu
- Lists all user folders
- Option to move to "Uncategorized"
- Auto-refreshes page after move

**`app/vault/page.tsx`**
- Server component fetches folders and preferences
- Passes data to VaultClient
- Simplified to mainly data fetching

## User Experience

### Creating a Folder

1. Click "New Folder" button in vault header
2. Enter folder name
3. (Optional) Choose custom icon
4. (Optional) Choose custom color
5. Click "Create"
6. Folder appears in vault

### Organizing Notes

1. Click (⋮) menu on any note card
2. Select "Move to Folder"
3. Choose destination folder (or "Uncategorized")
4. Note moves instantly

### Switching View Modes

1. Look for view toggle buttons in vault header (right side)
2. Grid icon (⊞) for grid view
3. List icon (☰) for list view
4. Click to switch
5. Preference saved automatically

### Folder Management

1. Each folder has (⋮) menu next to its name
2. **Edit Folder** - Change name, icon, or color
3. **Delete Folder** - Removes folder (notes stay, become uncategorized)
4. Folders can be expanded/collapsed by clicking header

## Visual Design

### Folder Colors
```
Indigo:  #6366f1
Violet:  #8b5cf6
Pink:    #ec4899
Rose:    #f43f5e
Orange:  #f97316
Yellow:  #eab308
Green:   #22c55e
Teal:    #14b8a6
Cyan:    #06b6d4
Blue:    #3b82f6
```

### Folder Icons
```
📁 📂 📚 📖 🗂️ 🗃️ 💼 🎒 🗄️ 📦
```

## Layout Structure

### Vault Page Structure
```
┌────────────────────────────────────────────────┐
│ Header: [New Folder] [New Rehash]             │
│ Filters: [All] [Video Essays]  [Grid|List]    │
├────────────────────────────────────────────────┤
│                                                │
│ 📁 Work Projects (5)              [⋮]         │
│ ├─ [Note Card]  [Note Card]  [Note Card]     │
│ └─ [Note Card]  [Note Card]                   │
│                                                │
│ 📚 Study Materials (8)            [⋮]         │
│ ├─ [Note Card]  [Note Card]  [Note Card]     │
│ └─ ...                                         │
│                                                │
│ Uncategorized (3)                              │
│ └─ [Note Card]  [Note Card]  [Note Card]     │
│                                                │
└────────────────────────────────────────────────┘
```

### Grid View (3 columns)
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Note 1  │  │ Note 2  │  │ Note 3  │
│ Summary │  │ Summary │  │ Summary │
│ Tags    │  │ Tags    │  │ Tags    │
└─────────┘  └─────────┘  └─────────┘
```

### List View (1 column, compact)
```
┌────────────────────────────────────────┐
│ 📄 Note 1    Summary text    [Tags] ⋮ │
├────────────────────────────────────────┤
│ 📄 Note 2    Summary text    [Tags] ⋮ │
├────────────────────────────────────────┤
│ 📄 Note 3    Summary text    [Tags] ⋮ │
└────────────────────────────────────────┘
```

## Benefits

### Organization Benefits
- **Logical Grouping** - Group related notes together
- **Visual Categories** - Color-code by project/topic
- **Easy Navigation** - Find notes faster with folders
- **Bulk Actions** - Manage groups of notes together
- **Clean Interface** - Collapsible folders reduce clutter

### View Mode Benefits
- **Flexibility** - Choose best view for your task
- **Grid View** - Better for browsing and previewing content
- **List View** - Better for quick scanning and finding specific notes
- **Personal Preference** - Saved per user
- **Context Switching** - Easily toggle between views

## Future Enhancements

Potential additions:
- Drag-and-drop notes into folders
- Folder nesting (subfolders)
- Folder sharing/collaboration
- Bulk move operations (select multiple notes)
- Custom folder sorting
- Folder templates
- Export entire folder
- Folder statistics/analytics
- Search within folders
- Recent folders list

## Troubleshooting

### Folders not appearing
1. Run migration `09-add-folders-and-view-preferences.sql`
2. Check RLS policies are enabled
3. Verify user is authenticated

### View mode not persisting
1. Check `user_preferences` table exists
2. Verify API route `/api/preferences/view-mode` works
3. Check browser console for errors

### Cannot move notes to folders
1. Verify folders exist for user
2. Check `/api/notes/move-to-folder` route
3. Ensure note and folder belong to same user

## TypeScript Types

```typescript
export interface Folder {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  order_index: number
  created_at: string
  updated_at: string
}

export type ViewMode = 'grid' | 'list'

export interface Note {
  // ... existing fields
  folder_id?: string | null
}
```

## Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only see/modify their own folders
- Users can only move their own notes
- Folder deletion doesn't delete notes (CASCADE safety)
- All API routes verify user ownership

## Performance

- **Indexes** added for:
  - `folders.user_id`
  - `folders.order_index`
  - `notes.folder_id`
- **GIN index** on `folders` table for fast queries
- Client-side folder state management
- Optimistic UI updates where possible

