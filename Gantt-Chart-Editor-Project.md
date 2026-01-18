# Gantt Chart Editor Project

## Project Overview

A React-based Gantt chart editor developed iteratively through conversation, allowing users to create, edit, and visualise project schedules with support for different dependency types and timeline scales.

---

## Development Conversation

### Request 1: Basic Gantt Chart

**User:**
> I want to create a very basic gantt chart editor which will allow me to enter activity name and duration and it draws the chart assuming finish to start relationship.

**Response:**
Created initial Gantt chart editor with:
- Input fields for activity name and duration (in days)
- Finish-to-start scheduling — each activity starts when the previous one ends
- Visual timeline with coloured bars showing when each activity runs
- Remove activities by clicking the × button
- Running total of project duration at the bottom

---

### Request 2: Drag and Drop Reordering

**User:**
> Enhance this by adding drag and drop between activities so that can can change the order of activities

**Response:**
Added drag and drop reordering functionality:
- Drag handle (⠿) on the left of each row
- Visual feedback — the dragged row becomes semi-transparent, and a blue line shows where it will drop
- Auto-recalculation — the timeline updates immediately when you reorder activities

---

### Request 3: Edit Activities with Dependency Types

**User:**
> Now allow me to edit the activities so that I can change the logic for finish start to start start. Make the edit button appear next to the activity delete button

**Response:**
Added full editing capabilities:
- Edit button (pencil icon) next to delete button
- Editable fields: Activity name, Duration (days), Dependency type dropdown (FS or SS)
- Dependency types:
  - **FS** (Finish-to-Start) — activity starts when its predecessor finishes (sequential)
  - **SS** (Start-to-Start) — activity starts when its predecessor starts (parallel)
- Visual indicators with blue badge for FS and amber badge for SS

---

### Request 4: Calendar Start Date

**User:**
> Now let me choose from a calendar the start date for the timeline

**Response:**
Added calendar date picker:
- Start Date picker — select project start date from a calendar (defaults to today)
- Timeline with real dates — column headers show day/month
- Activity bars display their actual date range
- Footer summary showing overall project date range

---

### Request 5: Fix Timeline Alignment

**User:**
> The timeline does not correspond with the duration. Is it possible to expand the timeline with duration?

**Response:**
Restructured timeline with fixed-width day columns (36px per day) and horizontal scrolling for longer projects. Added weekend shading and month boundary indicators.

---

### Request 6: Single Scrollbar for Timeline

**User:**
> That has not worked. I can scroll the rows individually but this does not enable me to see the full gantt chart. Remove these individual scroll bars and only enable the top scroll bar. This should then move all of the chart in order for me to see the dates of completion for all activities.

**Response:**
Restructured layout so there's a single horizontal scrollbar for the entire timeline section:
- Left side is fixed — activity names, days, and type columns stay in place
- Right side scrolls as one unit — timeline header, date columns, all activity bars, and footer scroll together

---

### Request 7: Zoom and Print Functionality

**User:**
> Now allow me to shrink the timeline view so that I am able to see all of the activities within a single view which I can then print off

**Response:**
Added zoom controls and print functionality:
- **Slider** — adjust day width from 8px to 50px
- **Fit to View** — automatically calculates zoom level to show all activities without scrolling
- **Reset Zoom** — returns to default 36px per day
- **Print button** — opens print dialog with clean layout (hides input controls, drag handles, edit buttons)

---

### Request 8: Multiple Timeline Scales

**User:**
> Zoom is good but it only copes with about 60 days. Beyond that the frame is too large. We need an alternative way to represent the timeline, using months and years as appropriate

**Response:**
Added multiple timeline scales:
- **Days** — shows each day (best for projects up to ~60 days)
- **Weeks** — shows week numbers with start dates (best for 2-6 month projects)
- **Months** — shows months with years (best for projects over 6 months)

Controls:
- Scale dropdown — manually select Days/Weeks/Months
- Auto button — automatically picks best scale based on project duration
- Zoom slider and Fit to View still available

---

### Request 9: Include Year in Dates

**User:**
> The dates within the activity bars need to indicate the year as well

**Response:**
Updated all date displays to include the year:
- Activity bar labels show "1 Jan 2026 - 31 Mar 2026"
- Hover tooltips include full dates with years
- Footer date range includes years
- Print title includes years

---

## Final Features Summary

### Core Features
- Add activities with name and duration
- Drag and drop to reorder activities
- Edit activity name, duration, and dependency type
- Delete activities
- Set project start date via calendar picker

### Dependency Types
- **FS (Finish-to-Start)** — Sequential execution
- **SS (Start-to-Start)** — Parallel execution

### Timeline Scales
- **Days** — Individual day columns
- **Weeks** — Weekly groupings
- **Months** — Monthly groupings
- **Auto** — Automatically selects best scale

### View Controls
- Zoom slider for fine-tuning
- Fit to View button
- Single synchronised scrollbar

### Print Support
- Clean print layout
- Hides editing controls
- Shows project title and date range

### Visual Indicators
- Colour-coded activity bars
- Weekend shading (day view)
- Month/year boundaries
- Dependency type badges

---

## Final Code

```jsx
import { useState, useRef, useEffect } from 'react';

export default function GanttChartEditor() {
  const [activities, setActivities] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', duration: '', dependency: 'FS' });
  const [unitWidth, setUnitWidth] = useState(36);
  const [timeScale, setTimeScale] = useState('days'); // 'days', 'weeks', 'months'
  
  const timelineContainerRef = useRef(null);

  const addActivity = () => {
    if (name.trim() && duration > 0) {
      setActivities([...activities, { 
        id: Date.now(), 
        name: name.trim(), 
        duration: parseInt(duration),
        dependency: 'FS'
      }]);
      setName('');
      setDuration('');
    }
  };

  const removeActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const startEditing = (activity) => {
    setEditingId(activity.id);
    setEditForm({
      name: activity.name,
      duration: activity.duration.toString(),
      dependency: activity.dependency || 'FS'
    });
  };

  const saveEdit = () => {
    if (editForm.name.trim() && editForm.duration > 0) {
      setActivities(activities.map(a => 
        a.id === editingId 
          ? { ...a, name: editForm.name.trim(), duration: parseInt(editForm.duration), dependency: editForm.dependency }
          : a
      ));
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDragStart = (e, index) => {
    if (editingId) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newActivities = [...activities];
    const [draggedItem] = newActivities.splice(draggedIndex, 1);
    newActivities.splice(dropIndex, 0, draggedItem);
    
    setActivities(newActivities);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDate = (date, format = 'short') => {
    if (format === 'short') {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
    if (format === 'withYear') {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const projectStartDate = new Date(startDate);

  const calculateStartTimes = () => {
    const startTimes = [];
    for (let i = 0; i < activities.length; i++) {
      if (i === 0) {
        startTimes.push(0);
      } else {
        const prevStart = startTimes[i - 1];
        const prevDuration = activities[i - 1].duration;
        const currentDependency = activities[i].dependency || 'FS';
        
        if (currentDependency === 'SS') {
          startTimes.push(prevStart);
        } else {
          startTimes.push(prevStart + prevDuration);
        }
      }
    }
    return startTimes;
  };

  const startTimes = calculateStartTimes();
  
  const calculateTotalDuration = () => {
    if (activities.length === 0) return 0;
    let maxEnd = 0;
    for (let i = 0; i < activities.length; i++) {
      const end = startTimes[i] + activities[i].duration;
      if (end > maxEnd) maxEnd = end;
    }
    return maxEnd;
  };

  const totalDuration = calculateTotalDuration();

  const generateTimelineUnits = () => {
    if (totalDuration === 0) return { units: [], totalUnits: 14 };
    
    const endDate = addDays(projectStartDate, totalDuration);
    const units = [];
    
    if (timeScale === 'days') {
      const numDays = Math.max(totalDuration, 14);
      for (let i = 0; i < numDays; i++) {
        const date = addDays(projectStartDate, i);
        units.push({
          date,
          label: date.getDate().toString(),
          subLabel: date.toLocaleDateString('en-GB', { month: 'short' }),
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          isFirstOfPeriod: date.getDate() === 1
        });
      }
      return { units, totalUnits: numDays };
    } 
    
    if (timeScale === 'weeks') {
      const numWeeks = Math.max(Math.ceil(totalDuration / 7), 4);
      for (let i = 0; i < numWeeks; i++) {
        const weekStart = addDays(projectStartDate, i * 7);
        units.push({
          date: weekStart,
          label: `W${i + 1}`,
          subLabel: `${weekStart.getDate()} ${weekStart.toLocaleDateString('en-GB', { month: 'short' })}`,
          isWeekend: false,
          isFirstOfPeriod: weekStart.getMonth() !== addDays(weekStart, -7).getMonth()
        });
      }
      return { units, totalUnits: numWeeks, daysPerUnit: 7 };
    }
    
    if (timeScale === 'months') {
      const startYear = projectStartDate.getFullYear();
      const startMonth = projectStartDate.getMonth();
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      
      const numMonths = Math.max((endYear - startYear) * 12 + (endMonth - startMonth) + 1, 3);
      
      for (let i = 0; i < numMonths; i++) {
        const monthDate = new Date(startYear, startMonth + i, 1);
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        units.push({
          date: monthDate,
          label: monthDate.toLocaleDateString('en-GB', { month: 'short' }),
          subLabel: monthDate.getFullYear().toString(),
          isWeekend: false,
          isFirstOfPeriod: monthDate.getMonth() === 0,
          daysInMonth
        });
      }
      return { units, totalUnits: numMonths, scale: 'months' };
    }
    
    return { units: [], totalUnits: 14 };
  };

  const { units: timelineUnits, totalUnits } = generateTimelineUnits();
  const timelineWidth = totalUnits * unitWidth;

  const getBarPosition = (startDay, durationDays) => {
    if (timeScale === 'days') {
      return {
        left: startDay * unitWidth + 2,
        width: Math.max(durationDays * unitWidth - 4, 4)
      };
    }
    
    if (timeScale === 'weeks') {
      const startWeek = startDay / 7;
      const durationWeeks = durationDays / 7;
      return {
        left: startWeek * unitWidth + 2,
        width: Math.max(durationWeeks * unitWidth - 4, 4)
      };
    }
    
    if (timeScale === 'months') {
      const activityStart = addDays(projectStartDate, startDay);
      const activityEnd = addDays(projectStartDate, startDay + durationDays - 1);
      
      let leftOffset = 0;
      let barWidth = 0;
      let foundStart = false;
      
      for (let i = 0; i < timelineUnits.length; i++) {
        const unit = timelineUnits[i];
        const monthStart = unit.date;
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const daysInMonth = unit.daysInMonth;
        
        if (!foundStart) {
          if (activityStart <= monthEnd) {
            foundStart = true;
            const dayInMonth = activityStart >= monthStart 
              ? activityStart.getDate() - 1 
              : 0;
            leftOffset = i * unitWidth + (dayInMonth / daysInMonth) * unitWidth;
          }
        }
        
        if (foundStart) {
          if (activityEnd <= monthEnd) {
            const endDayInMonth = activityEnd >= monthStart 
              ? activityEnd.getDate() 
              : 0;
            const startDayInMonth = activityStart >= monthStart && activityStart <= monthEnd
              ? activityStart.getDate() - 1
              : 0;
            
            if (activityStart >= monthStart) {
              barWidth = ((endDayInMonth - startDayInMonth) / daysInMonth) * unitWidth;
            } else {
              barWidth += (endDayInMonth / daysInMonth) * unitWidth;
            }
            break;
          } else {
            if (activityStart >= monthStart && activityStart <= monthEnd) {
              const startDayInMonth = activityStart.getDate() - 1;
              barWidth += ((daysInMonth - startDayInMonth) / daysInMonth) * unitWidth;
            } else {
              barWidth += unitWidth;
            }
          }
        }
      }
      
      return {
        left: leftOffset + 2,
        width: Math.max(barWidth - 4, 4)
      };
    }
    
    return { left: 0, width: 0 };
  };

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
  ];

  const suggestScale = () => {
    if (totalDuration <= 60) return 'days';
    if (totalDuration <= 180) return 'weeks';
    return 'months';
  };

  const fitToView = () => {
    if (timelineContainerRef.current && totalUnits > 0) {
      const containerWidth = timelineContainerRef.current.offsetWidth - 20;
      const newUnitWidth = Math.max(20, Math.floor(containerWidth / totalUnits));
      setUnitWidth(Math.min(newUnitWidth, 80));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const autoScale = () => {
    const suggested = suggestScale();
    setTimeScale(suggested);
    if (suggested === 'days') setUnitWidth(36);
    else if (suggested === 'weeks') setUnitWidth(60);
    else setUnitWidth(80);
  };

  // ... Component JSX continues (see full file for complete implementation)
}
```

---

## Usage Instructions

1. **Set Start Date** — Use the date picker to select when your project begins
2. **Add Activities** — Enter activity name and duration in days, then click Add
3. **Reorder** — Drag activities using the grip handle on the left
4. **Edit** — Click the pencil icon to modify name, duration, or dependency type
5. **Change Scale** — Select Days/Weeks/Months or click Auto for best fit
6. **Adjust Zoom** — Use slider or Fit to View button
7. **Print** — Click Print button for a clean printable version

---

## Project Files

- `gantt-editor.jsx` — Main React component
- `README.md` — This documentation file

---

*Document created: January 2026*
*Technology: React with Tailwind CSS*
