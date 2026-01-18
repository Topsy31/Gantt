# Gantt Chart Editor

A React-based interactive Gantt chart editor for project scheduling.

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel (for in-browser JSX compilation)
- No build step required - runs directly in browser

## Files

- `index.html` - Standalone HTML file containing the full application
- `gantt-editor.jsx` - Original React component (for reference/integration into React projects)

## Features

- Add/edit/delete activities with name and duration
- Drag and drop reordering
- Dependency types: FS (Finish-to-Start), SS (Start-to-Start)
- Timeline scales: Days, Weeks, Months (with Auto-select)
- Zoom controls and Fit to View
- Print functionality with colored bars
- Project start date picker

## Usage

Open `index.html` directly in a web browser. No server or build process needed.

## Development Notes

- Colors cycle through 6 options: blue, green, purple, orange, pink, teal
- Print styles force background colors with `print-color-adjust: exact`
- Timeline automatically adjusts based on total project duration
