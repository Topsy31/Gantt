# Gantt Chart Editor

A beautiful, interactive Gantt chart editor that runs entirely in your browser. No installation required - just open `index.html` and start planning your projects!

## Features

- **Visual Timeline** - See your project schedule at a glance with colored activity bars
- **Multiple Themes** - Choose from 4 beautiful themes: Architectural Blueprint, Fun & Vibrant, Traditional, and Dark Mode
- **Flexible Time Scales** - View your timeline in Days, Weeks, or Months
- **Drag & Drop Reordering** - Easily reorganize activities by dragging them
- **Dependency Types** - Support for Finish-to-Start (FS) and Start-to-Start (SS) dependencies
- **Milestones** - Mark key dates with diamond-shaped milestones (set duration to 0)
- **Print Support** - Print as visual chart or table format, with headers repeating across pages
- **Save/Load Projects** - Export and import your projects as JSON files
- **Auto-Save** - Your work is automatically saved to your browser's local storage
- **Zoom Controls** - Adjust the timeline zoom level to fit your needs
- **Works Offline** - All dependencies are bundled locally

## Getting Started

1. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. Set your project start date
3. Add activities with names and durations
4. Adjust the timeline scale and zoom as needed
5. Save your project to a JSON file for backup

## File Structure

```
gantt-chart-editor/
├── index.html      # Main application file
├── styles.css      # Application styles and themes
├── fonts.css       # Font definitions
├── lib/            # JavaScript libraries
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   ├── babel.min.js
│   └── tailwind.min.js
└── README.md       # This file
```

## Tips

- **Milestones**: Set duration to 0 to create a milestone (diamond marker)
- **Dependencies**:
  - FS (Finish-to-Start): Activity starts after the previous one finishes
  - SS (Start-to-Start): Activity starts at the same time as the previous one
- **Printing**: Use "Print as Chart" for visual output, or "Print as Table" for a text-based list
- **Keyboard**: Press Enter after typing an activity name or duration to quickly add it

## Browser Support

Works in all modern browsers:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Apple Safari

## License

This software is licensed for personal and commercial use.
Redistribution of the source code is not permitted.

---

Thank you for your purchase! If you have any questions or feedback, please reach out: mark@emsity.com

