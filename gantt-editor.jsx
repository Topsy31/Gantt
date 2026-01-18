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

  // Generate timeline units based on scale
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
        const weekEnd = addDays(weekStart, 6);
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

  // Calculate position and width for activity bars based on scale
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
      // Calculate based on actual days within months
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
        
        // Calculate where activity starts within this month
        if (!foundStart) {
          if (activityStart <= monthEnd) {
            foundStart = true;
            const dayInMonth = activityStart >= monthStart 
              ? activityStart.getDate() - 1 
              : 0;
            leftOffset = i * unitWidth + (dayInMonth / daysInMonth) * unitWidth;
          }
        }
        
        // Calculate width
        if (foundStart) {
          if (activityEnd <= monthEnd) {
            // Activity ends in this month
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
            // Activity continues past this month
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

  // Auto-suggest scale based on duration
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
    // Reset unit width for the new scale
    if (suggested === 'days') setUnitWidth(36);
    else if (suggested === 'weeks') setUnitWidth(60);
    else setUnitWidth(80);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .gantt-print-area, .gantt-print-area * { visibility: visible; }
          .gantt-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-title { display: block !important; }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Gantt Chart Editor</h1>
        <p className="text-gray-500 text-sm mb-6">Drag to reorder • Click edit to change dependency type (FS/SS)</p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              placeholder="Activity name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addActivity()}
              className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addActivity()}
              min="1"
              className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addActivity}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Scale and Zoom Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Scale:</label>
            <select
              value={timeScale}
              onChange={(e) => {
                setTimeScale(e.target.value);
                if (e.target.value === 'days') setUnitWidth(36);
                else if (e.target.value === 'weeks') setUnitWidth(60);
                else setUnitWidth(80);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
            <button
              onClick={autoScale}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              title="Automatically select best scale for duration"
            >
              Auto
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Zoom:</label>
            <input
              type="range"
              min="20"
              max="100"
              value={unitWidth}
              onChange={(e) => setUnitWidth(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          
          <button
            onClick={fitToView}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Fit to View
          </button>
          
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8 no-print">Add activities to see the Gantt chart</p>
      ) : (
        <div className="gantt-print-area">
          <div className="print-title hidden mb-4">
            <h1 className="text-xl font-bold text-gray-800">Project Gantt Chart</h1>
            <p className="text-sm text-gray-600">
              {formatDate(projectStartDate, 'withYear')} → {formatDate(addDays(projectStartDate, totalDuration - 1), 'withYear')} ({totalDuration} days)
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex">
              {/* Fixed Left Section */}
              <div className="flex-shrink-0">
                <div className="flex bg-gray-100 border-b border-gray-200">
                  <div className="w-8 px-2 py-2 border-r border-gray-200 no-print"></div>
                  <div className="w-40 px-3 py-2 font-semibold text-gray-700 border-r border-gray-200">Activity</div>
                  <div className="w-16 px-2 py-2 font-semibold text-gray-700 border-r border-gray-200 text-center">Days</div>
                  <div className="w-14 px-2 py-2 font-semibold text-gray-700 border-r border-gray-200 text-center">Type</div>
                </div>

                <div className="flex bg-gray-50 border-b border-gray-200 h-12">
                  <div className="w-8 border-r border-gray-200 no-print"></div>
                  <div className="w-40 border-r border-gray-200"></div>
                  <div className="w-16 border-r border-gray-200"></div>
                  <div className="w-14 border-r border-gray-200"></div>
                </div>

                {activities.map((activity, index) => {
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;
                  const isEditing = editingId === activity.id;

                  return (
                    <div
                      key={activity.id}
                      draggable={!isEditing}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`
                        flex border-b border-gray-200 last:border-b-0 transition-all duration-150 h-12
                        ${isDragging ? 'opacity-50 bg-blue-50' : 'hover:bg-gray-50'}
                        ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}
                        ${isEditing ? 'bg-yellow-50' : ''}
                      `}
                    >
                      <div className="w-8 px-2 border-r border-gray-200 flex items-center justify-center cursor-grab active:cursor-grabbing no-print">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                        </svg>
                      </div>
                      
                      {isEditing ? (
                        <>
                          <div className="w-40 px-2 border-r border-gray-200 flex items-center gap-1 no-print">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-700" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button onClick={cancelEdit} className="p-1 text-red-500 hover:text-red-600" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="w-16 px-1 border-r border-gray-200 flex items-center no-print">
                            <input
                              type="number"
                              value={editForm.duration}
                              onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                              min="1"
                              className="w-full px-1 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="w-14 px-1 border-r border-gray-200 flex items-center no-print">
                            <select
                              value={editForm.dependency}
                              onChange={(e) => setEditForm({...editForm, dependency: e.target.value})}
                              className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="FS">FS</option>
                              <option value="SS">SS</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-40 px-3 border-r border-gray-200 flex items-center justify-between">
                            <span className="truncate">{activity.name}</span>
                            <div className="flex items-center gap-1 ml-2 no-print">
                              <button onClick={() => startEditing(activity)} className="text-gray-400 hover:text-blue-500" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button onClick={() => removeActivity(activity.id)} className="text-gray-400 hover:text-red-500 text-lg leading-none" title="Delete">
                                ×
                              </button>
                            </div>
                          </div>
                          <div className="w-16 px-2 border-r border-gray-200 text-center text-gray-600 flex items-center justify-center">
                            {activity.duration}
                          </div>
                          <div className="w-14 px-2 border-r border-gray-200 flex items-center justify-center">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              activity.dependency === 'SS' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {activity.dependency || 'FS'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                <div className="flex bg-gray-100 border-t border-gray-200 h-10">
                  <div className="w-8 border-r border-gray-200 no-print"></div>
                  <div className="w-40 px-3 font-semibold text-gray-700 border-r border-gray-200 flex items-center">Total Duration</div>
                  <div className="w-16 px-2 font-semibold text-gray-700 border-r border-gray-200 flex items-center justify-center">
                    {totalDuration}
                  </div>
                  <div className="w-14 border-r border-gray-200"></div>
                </div>
              </div>

              {/* Scrollable Timeline Section */}
              <div className="flex-1 overflow-x-auto" ref={timelineContainerRef}>
                <div style={{ width: timelineWidth, minWidth: '100%' }}>
                  <div className="bg-gray-100 border-b border-gray-200 px-2 py-2 font-semibold text-gray-700">
                    Timeline ({timeScale})
                  </div>

                  <div className="flex bg-gray-50 border-b border-gray-200 text-xs text-gray-500 h-12">
                    {timelineUnits.map((unit, i) => (
                      <div 
                        key={i} 
                        className={`text-center border-r border-gray-200 last:border-r-0 flex flex-col justify-center 
                          ${unit.isWeekend ? 'bg-gray-100' : ''} 
                          ${unit.isFirstOfPeriod ? 'border-l-2 border-l-gray-400' : ''}`}
                        style={{ width: unitWidth, minWidth: unitWidth }}
                      >
                        <div className="font-medium leading-tight truncate px-0.5">{unit.label}</div>
                        <div className="text-gray-400 text-xs truncate leading-tight px-0.5">{unit.subLabel}</div>
                      </div>
                    ))}
                  </div>

                  {activities.map((activity, index) => {
                    const start = startTimes[index];
                    const color = colors[index % colors.length];
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;
                    const isEditing = editingId === activity.id;

                    const activityStartDate = addDays(projectStartDate, start);
                    const activityEndDate = addDays(projectStartDate, start + activity.duration - 1);
                    const barPos = getBarPosition(start, activity.duration);

                    return (
                      <div
                        key={activity.id}
                        className={`
                          relative border-b border-gray-200 last:border-b-0 h-12 transition-all duration-150
                          ${isDragging ? 'opacity-50 bg-blue-50' : ''}
                          ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}
                          ${isEditing ? 'bg-yellow-50' : ''}
                        `}
                      >
                        <div className="absolute inset-0 flex">
                          {timelineUnits.map((unit, i) => (
                            <div 
                              key={i}
                              className={`border-r border-gray-100 ${unit.isWeekend ? 'bg-gray-50' : ''}`}
                              style={{ width: unitWidth, minWidth: unitWidth }}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-y-0 flex items-center" style={{ left: barPos.left }}>
                          <div
                            className={`${color} h-8 rounded text-white text-xs flex items-center justify-center shadow-sm`}
                            style={{ width: barPos.width }}
                            title={`${activity.name}: ${formatDate(activityStartDate, 'withYear')} - ${formatDate(activityEndDate, 'withYear')} (${activity.duration} days)`}
                          >
                            {barPos.width > 120 && (
                              <span className="px-1 truncate">
                                {formatDate(activityStartDate, 'withYear')} - {formatDate(activityEndDate, 'withYear')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-gray-100 border-t border-gray-200 h-10 px-3 flex items-center text-sm text-gray-600">
                    {activities.length > 0 && (
                      <span>
                        {formatDate(projectStartDate, 'withYear')} → {formatDate(addDays(projectStartDate, totalDuration - 1), 'withYear')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 no-print">
        <span className="font-medium">Legend:</span>
        <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">FS</span> Finish-to-Start
        <span className="ml-3 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">SS</span> Start-to-Start
        {timeScale === 'days' && (
          <>
            <span className="ml-3">|</span>
            <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100">Shaded</span> Weekend
          </>
        )}
      </div>
    </div>
  );
}
