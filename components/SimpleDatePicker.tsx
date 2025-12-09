'use client';

import { useState } from 'react';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';

interface SimpleDatePickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function SimpleDatePicker({ selectedDate, onSelectDate }: SimpleDatePickerProps) {
  const today = new Date();

  // Initialize with selected date or today's month/year
  const initialDate = selectedDate || today;
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Monday, 6 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);

    const days: Array<{ date: number; isCurrentMonth: boolean; fullDate: Date; isEmpty: boolean }> = [];

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: 0,
        isCurrentMonth: false,
        fullDate: new Date(),
        isEmpty: true
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(displayYear, displayMonth, i),
        isEmpty: false
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  // Date click handler - immediately apply selection
  const handleDateClick = (date: Date) => {
    onSelectDate(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg" style={{ border: '1px solid #E3E3E3', width: '300px', padding: '16px' }}>
      {/* Month/Year header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#252525' }}>
            {monthNames[displayMonth]}
          </span>
          <span className="text-sm font-semibold" style={{ color: '#252525' }}>
            {displayYear}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRightOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2" style={{ columnGap: '8px' }}>
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium py-1"
            style={{ color: '#6B7280', width: '36px' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7" style={{ columnGap: '8px', rowGap: '8px' }}>
        {calendarDays.map((day, index) => {
          if (day.isEmpty) {
            return (
              <div
                key={index}
                style={{
                  width: '36px',
                  height: '36px',
                }}
              />
            );
          }

          const isSelected = isSameDay(day.fullDate, selectedDate);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.fullDate)}
              className={`
                text-center text-xs font-normal transition-colors rounded
                ${isSelected ? 'bg-[#252525] text-white font-semibold' : 'text-[#252525] hover:bg-[#F5F5F5]'}
              `}
              style={{
                width: '36px',
                height: '36px',
              }}
            >
              {day.date}
            </button>
          );
        })}
      </div>
    </div>
  );
}
