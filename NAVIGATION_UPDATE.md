# Navigation Update - Easy Access Across App

## Overview

Added a consistent navigation header (`AppNav`) across all pages (except landing page) for easy access to key features.

## New Component: AppNav

**File:** `components/app-nav.tsx`

A reusable navigation header with:
- **New Rehash** button - Quick access to create new content
- **Vault** button - Access vault of all notes
- **Video Essays** button - Filter to show only video essay content
- Active state highlighting based on current page
- Sticky positioning at top of page

## Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│  Rehash   [+ New] [Vault] [Video Essays]  👤 │
└─────────────────────────────────────────────────────┘
```

### Navigation Items

1. **New Rehash** (`/upload`)
   - Icon: Plus (+)
   - Takes users to upload page
   - Active when on upload page

2. **Vault** (`/vault`)
   - Icon: Folder
   - Shows all user's rehashed content
   - Active when on vault, review, or audio pages

3. **Video Essays** (`/vault?filter=video-essays`)
   - Icon: Microphone
   - Filters vault to show only notes with video essays
   - Shows count of video essays in badge

## Pages Updated

### 1. **Review Page** (`app/review/[id]/page.tsx`)
- ✅ Replaced custom header with `<AppNav />`
- Shows when viewing a specific note's details
- "Vault" button is active (parent context)

### 2. **Audio/Video Essay Page** (`app/audio/[id]/page.tsx`)
- ✅ Replaced custom header with `<AppNav />`
- Both the main page and error state
- "Vault" button is active

### 3. **Vault Page** (`app/vault/page.tsx`)
- ✅ Replaced custom header with `<AppNav />`
- Added filter badges below page title
- Shows count for "All" and "Video Essays"
- Filter badges allow quick switching between views

### 4. **Upload Page** (`app/upload/page.tsx`)
- ✅ Replaced custom header with `<AppNav />`
- "New Rehash" button is active

## Vault Filtering

The vault page now supports filtering by video essays:

### Filter Badges

```
┌──────────────────────────────────────┐
│  [📁 All (24)] [🎤 Video Essays (8)] │
└──────────────────────────────────────┘
```

- **All** - Shows all rehashes
- **Video Essays** - Shows only notes with `script_text` or `audio_url`
- Badges show count for each category
- Clicking switches between views

### Implementation

When `?filter=video-essays` query parameter is present:
- Filters notes to only those with scripts or audio
- Updates page title to "Video Essays"
- Changes description text
- Shows count of filtered items

## Features

### Active State Highlighting
- Current page button has `bg-muted text-foreground` styling
- Visual indicator of where user is in the app

### Responsive Design
- Navigation items hidden on mobile (`hidden md:flex`)
- Logo and auth button always visible
- Full navigation shown on medium+ screens

### Sticky Header
- Header sticks to top of page (`sticky top-0 z-50`)
- Backdrop blur effect for modern look
- Border bottom for visual separation

## Benefits

1. **Consistent Navigation**: Same navigation across all authenticated pages
2. **Quick Access**: One-click access to create, view all, or filter content
3. **Context Awareness**: Active state shows current location
4. **Video Essay Discovery**: Dedicated button to find video essay content
5. **Better UX**: No need to go back to homepage for navigation

## User Flow Examples

### Creating New Video Essay
```
Any Page → Click "New Rehash" → Upload content → Generate script → Create video essay
```

### Finding Video Essays
```
Any Page → Click "Video Essays" → Filtered vault view → Select video essay
```

### Managing All Content
```
Any Page → Click "Vault" → Full vault view → Browse all notes
```

## Technical Details

### AppNav Props
None required - automatically detects current path using `usePathname()`

### Path Detection
```typescript
const isActive = (path: string) => {
  if (path === '/vault') {
    return pathname === '/vault' || 
           pathname?.startsWith('/review/') || 
           pathname?.startsWith('/audio/')
  }
  return pathname?.startsWith(path)
}
```

### Filter Implementation
```typescript
// In vault page
const isVideoEssayFilter = filter === 'video-essays'

if (isVideoEssayFilter && allNotes) {
  notes = allNotes.filter(note => 
    (note.script_text && note.script_text.trim().length > 0) || 
    (note.audio_url && note.audio_url.trim().length > 0)
  )
}
```

## Landing Page Exception

The landing page (`app/page.tsx`) does NOT use `<AppNav />` because:
- It has its own marketing/hero header
- Users are not authenticated yet
- Different navigation needs for public page

## Future Enhancements

Potential additions:
- Mobile hamburger menu for small screens
- Search functionality in navigation
- Breadcrumb trail for deep pages
- Keyboard shortcuts for navigation
- User profile dropdown in auth button

