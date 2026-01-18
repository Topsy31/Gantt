# Kanban Board Implementation Plan

## Overview
Build a complementary Kanban board that integrates with the Gantt chart's JSON format, enabling drag-and-drop workflow management for project activities.

---

## File Structure
```
Kanban/
  index.html      - Main application (standalone, like Gantt)
  styles.css      - Theme system (adapted from Gantt's styles.css)
```

---

## Data Model

### Extended JSON Format (backward-compatible with Gantt)
```json
{
  "startDate": "YYYY-MM-DD",
  "theme": "blueprint",
  "activities": [
    {
      "name": "Task name",
      "duration": 5,
      "dependency": "FS",
      "kanban": {
        "status": "plan" | "underway" | "complete",
        "owner": "Person name",
        "startedDate": "YYYY-MM-DD",
        "completedDate": "YYYY-MM-DD",
        "notes": "Progress notes..."
      }
    }
  ]
}
```

- **Gantt can read Kanban files**: Gantt ignores the `kanban` property
- **Kanban can read Gantt files**: Missing `kanban` defaults to `{ status: "plan" }`
- **Kanban works standalone**: Users can create tasks directly without importing from Gantt

---

## Three Columns

| Column | Status Value | Auto-populated Fields |
|--------|-------------|----------------------|
| **Plan** | `"plan"` | None (source data) |
| **Underway** | `"underway"` | `startedDate` set to today when moved here |
| **Complete** | `"complete"` | `completedDate` set to today when moved here |

---

## UI Design

### Wireframe - Main Board View
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ≡  Kanban Board                                    [Blueprint ▼] 📂 💾 🗑️     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  + Add New Task...                                              [Add]   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│   │      📋 PLAN        │  │    🔄 UNDERWAY      │  │    ✅ COMPLETE      │    │
│   │        (3)          │  │        (2)          │  │        (4)          │    │
│   ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤    │
│   │                     │  │                     │  │                     │    │
│   │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │    │
│   │  │▓▓ Task Name   │  │  │  │▓▓ Task Name   │  │  │  │▓▓ Task Name   │  │    │
│   │  │   5 days      │  │  │  │   3 days      │  │  │  │   2 days      │  │    │
│   │  │   ⋮ drag      │  │  │  │   👤 Jane     │  │  │  │   👤 Bob      │  │    │
│   │  └───────────────┘  │  │  │   📅 Jan 10   │  │  │  │   📅 Jan 5-12 │  │    │
│   │                     │  │  └───────────────┘  │  │  └───────────────┘  │    │
│   │  ┌───────────────┐  │  │                     │  │                     │    │
│   │  │▓▓ Task Name   │  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │    │
│   │  │   10 days     │  │  │  │▓▓ Task Name   │  │  │  │▓▓ Task Name   │  │    │
│   │  │   ⋮ drag      │  │  │  │   7 days      │  │  │  │   4 days      │  │    │
│   │  └───────────────┘  │  │  │   👤 Alice    │  │  │  │   👤 Jane     │  │    │
│   │                     │  │  │   📅 Jan 8    │  │  │  │   📅 Jan 3-8  │  │    │
│   │  ┌───────────────┐  │  │  │   📝 Notes... │  │  │  │   📝 Notes... │  │    │
│   │  │▓▓ Task Name   │  │  │  └───────────────┘  │  │  └───────────────┘  │    │
│   │  │   2 days      │  │  │                     │  │                     │    │
│   │  │   ⋮ drag      │  │  │                     │  │  ... more cards ... │    │
│   │  └───────────────┘  │  │                     │  │                     │    │
│   │                     │  │                     │  │                     │    │
│   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Legend:
▓▓ = Color bar (cycles through 6 theme colors, matches Gantt)
⋮  = Drag handle
📂 = Open file    💾 = Save file    🗑️ = Clear all
```

### Wireframe - Card Collapsed (Plan Column)
```
┌──────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Color bar (full width at top)
├──────────────────────────────────┤
│  ⋮⋮  Website Redesign            │  ← Drag handle + Task name
│      📅 5 days                   │  ← Duration
└──────────────────────────────────┘
```

### Wireframe - Card Expanded (Click to Edit)
```
┌──────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Task Name                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Website Redesign                               │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Duration          Owner                             │
│  ┌──────────┐      ┌────────────────────────────┐   │
│  │ 5        │ days │ Jane Smith                 │   │
│  └──────────┘      └────────────────────────────┘   │
│                                                      │
│  Started           Completed                         │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 2026-01-10   │  │ 2026-01-15   │  (date pickers) │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  Notes                                               │
│  ┌────────────────────────────────────────────────┐  │
│  │ Initial wireframes complete. Waiting for       │  │
│  │ feedback from stakeholders before proceeding   │  │
│  │ with high-fidelity mockups.                    │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│                              [🗑️ Delete]  [✓ Done]   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Wireframe - Add New Task Form
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────┐  ┌─────────┐                     │
│  │ Enter task name...                    │  │ 1       │ days   [+ Add]     │
│  └───────────────────────────────────────┘  └─────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe - Drag & Drop States
```
Dragging a card:
┌─────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Card becomes semi-transparent (50% opacity)
│  Website Redesign   │    with subtle shadow
│  5 days             │
└─────────────────────┘

Drop target column:
┌─────────────────────┐
│    🔄 UNDERWAY      │
│        (2)          │
├─────────────────────┤  ← Column header highlights with accent color
│  ╔═════════════════╗│  ← Dashed border indicates drop zone
│  ║   Drop here     ║│
│  ╚═════════════════╝│
│  ┌───────────────┐  │
│  │ Existing card │  │
│  └───────────────┘  │
└─────────────────────┘
```

### Wireframe - Theme Variations

**Blueprint Theme:**
- Background: warm stone (#fafaf9)
- Cards: white with subtle shadow
- Color bars: muted tones (slate, sage, tan)
- Font: DM Sans

**Fun Theme:**
- Background: soft gradient
- Cards: rounded corners (20px), playful shadows
- Color bars: vibrant (pink, purple, cyan)
- Font: Nunito (rounded)

**Traditional Theme:**
- Background: light gray
- Cards: crisp borders
- Color bars: classic (blue, green, red, yellow)
- Font: Segoe UI

**Dark Theme:**
- Background: dark gray (#1a1a2e)
- Cards: darker surface with glow
- Color bars: neon-ish (indigo, green, amber)
- Font: DM Sans

### Card States
1. **Collapsed (default)**: Shows name, duration, color bar
2. **Expanded (on click)**: Shows all fields with inline edit capability

### Card Fields by Column
- **Plan**: Name, Duration (from Gantt), color indicator
- **Underway**: + Owner, Started Date (auto but editable via date picker), Notes textarea
- **Complete**: + Completed Date (auto but editable via date picker), full history

### Visual Elements
- Color bars matching Gantt (bar-1 through bar-6, cycling)
- Drag handle on each card
- Card count in column headers
- Theme-consistent styling (same CSS variables as Gantt)

---

## Interactions

### Drag & Drop
- Drag cards between columns
- Visual feedback: dragging opacity, drop zone highlight
- Auto-set dates on column transitions (as defaults):
  - → Underway: Set `startedDate` to today (if not already set)
  - → Complete: Set `completedDate` to today
- **Dates are editable**: Users can manually change start/complete dates via date picker inputs to reflect actual work dates

### Card Editing (inline expansion)
- Click card to expand
- Edit fields directly in the expanded view
- Changes auto-save to localStorage
- Click outside or press Escape to collapse

### Card Deletion
- Delete button visible on expanded card (trash icon)
- Confirmation prompt before deletion ("Delete this task?")
- Removes activity from the activities array entirely
- Auto-saves to localStorage after deletion

### Add New Task
- "Add New Task" button in header area (or per-column "+ Add" buttons)
- Opens inline form to enter:
  - Task name (required)
  - Duration in days (optional, defaults to 1)
- New tasks are added to the **Plan** column by default
- Allows Kanban to work standalone without importing from Gantt

### Keyboard Support
- Enter to save edits / create new task
- Escape to cancel/collapse
- Tab navigation through fields

---

## Persistence

### LocalStorage (real-time)
- Key: `kanban-project`
- Auto-saves on every change
- Stores: activities, startDate, theme

### File I/O
- **Open**: Accepts `gantt-project.json` or any JSON with matching schema
- **Save**: Downloads as `gantt-project.json` (same name = round-trip compatible)
- **Clear**: Resets to empty state with confirmation

---

## Theme System

Copy from Gantt's styles.css:
- 4 themes: blueprint, fun, traditional, dark
- CSS variables for colors, fonts, radii
- Same `data-theme` attribute pattern
- Same button/input/card styling classes

---

## Implementation Steps

### 1. Create Kanban/styles.css
- Copy theme CSS variables from Gantt
- Add Kanban-specific styles (column layout, cards, drag states)

### 2. Create Kanban/index.html
- React 18 + Tailwind (via CDN, same as Gantt)
- Babel for in-browser JSX
- Main components:
  - `KanbanBoard` - main container
  - `Column` - Plan/Underway/Complete
  - `Card` - individual task card
  - `CardExpanded` - edit view

### 3. State Management
```javascript
const [activities, setActivities] = useState([]);
const [startDate, setStartDate] = useState(today);
const [theme, setTheme] = useState('blueprint');
const [expandedCard, setExpandedCard] = useState(null);
```

### 4. Drag & Drop Implementation
- Use HTML5 drag/drop API (same pattern as Gantt reordering)
- `onDragStart`, `onDragOver`, `onDrop` handlers
- Update activity's `kanban.status` on drop

### 5. File Handling
- Reuse Gantt's pattern: FileReader for load, Blob + anchor for save
- Merge logic: preserve Gantt fields, add/update kanban fields

---

## Verification

1. **Create new task**: Add a task directly in Kanban without any file - appears in Plan column
2. **Open Gantt JSON**: Load a file saved from Gantt Chart - all items should appear in Plan column
2. **Drag to Underway**: Card shows startedDate auto-populated
3. **Edit card**: Add owner and notes, verify localStorage saves
4. **Drag to Complete**: completedDate auto-populated
5. **Save file**: Download, verify JSON structure includes kanban data
6. **Delete card**: Delete a task, confirm it's removed from all views and saved state
7. **Re-open in Gantt**: Verify Gantt still works with extended JSON
8. **Theme switching**: All 4 themes render correctly
9. **Offline use**: Works without internet (CDN cached)
