'use client';

import { useState, useEffect } from 'react';
import KeyboardDoubleArrowLeftOutlined from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import KeyboardDoubleArrowRightOutlined from '@mui/icons-material/KeyboardDoubleArrowRightOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';

interface DatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelectDateRange: (startDate: Date, endDate: Date | null) => void;
  onClose?: () => void;
}

type Preset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | null;

export default function DatePicker({ startDate, endDate, onSelectDateRange, onClose }: DatePickerProps) {
  const today = new Date();

  // Date comparison utilities
  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Check if user's selection matches a preset
  const checkPresetMatch = (start: Date | null, end: Date | null): Preset => {
    if (!start) return 'custom';

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Check Today
    if (!end && isSameDay(start, now)) {
      return 'today';
    }

    // Check Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!end && isSameDay(start, yesterday)) {
      return 'yesterday';
    }

    // Check Last 7 days
    const last7Start = new Date(now);
    last7Start.setDate(last7Start.getDate() - 6);
    if (end && isSameDay(start, last7Start) && isSameDay(end, now)) {
      return 'last7days';
    }

    // Check Last 30 days
    const last30Start = new Date(now);
    last30Start.setDate(last30Start.getDate() - 29);
    if (end && isSameDay(start, last30Start) && isSameDay(end, now)) {
      return 'last30days';
    }

    return 'custom';
  };

  const [selectedPreset, setSelectedPreset] = useState<Preset>(() => checkPresetMatch(startDate, endDate));
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  // Left calendar starts with current month, right calendar shows next month
  const [leftMonth, setLeftMonth] = useState(today.getMonth());
  const [leftYear, setLeftYear] = useState(today.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate right calendar month/year
  const getRightCalendar = () => {
    if (leftMonth === 11) {
      return { month: 0, year: leftYear + 1 };
    }
    return { month: leftMonth + 1, year: leftYear };
  };

  const rightCalendar = getRightCalendar();

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Monday, 6 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  // Generate calendar days for a specific month
  const generateCalendarDays = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

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

    // Current month days only
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
        isEmpty: false
      });
    }

    return days;
  };

  const leftDays = generateCalendarDays(leftMonth, leftYear);
  const rightDays = generateCalendarDays(rightCalendar.month, rightCalendar.year);

  // Navigation handlers
  const handlePrevYear = () => {
    setLeftYear(leftYear - 1);
  };

  const handleNextYear = () => {
    setLeftYear(leftYear + 1);
  };

  const handlePrevMonth = () => {
    if (leftMonth === 0) {
      setLeftMonth(11);
      setLeftYear(leftYear - 1);
    } else {
      setLeftMonth(leftMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (leftMonth === 11) {
      setLeftMonth(0);
      setLeftYear(leftYear + 1);
    } else {
      setLeftMonth(leftMonth + 1);
    }
  };

  const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
    if (!start) return false;
    if (!end) return isSameDay(date, start);

    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();

    return dateTime >= startTime && dateTime <= endTime;
  };

  const isDateBetween = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;

    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();

    return dateTime > startTime && dateTime < endTime;
  };

  // Calculate days between dates
  const getDaysBetween = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date for input fields
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Preset handlers
  const handlePresetClick = (preset: Preset) => {
    setSelectedPreset(preset);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'today':
        setTempStartDate(now);
        setTempEndDate(null);
        break;

      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        setTempStartDate(yesterday);
        setTempEndDate(null);
        break;

      case 'last7days':
        const last7Start = new Date(now);
        last7Start.setDate(last7Start.getDate() - 6);
        setTempStartDate(last7Start);
        setTempEndDate(now);
        break;

      case 'last30days':
        const last30Start = new Date(now);
        last30Start.setDate(last30Start.getDate() - 29);
        setTempStartDate(last30Start);
        setTempEndDate(now);
        break;

      case 'custom':
        setTempStartDate(null);
        setTempEndDate(null);
        break;
    }
  };

  // Date click handler
  const handleDateClick = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // First click or reset
      setTempStartDate(date);
      setTempEndDate(null);
    } else {
      // Second click - set end date
      if (date < tempStartDate) {
        // If clicked date is before start, swap them
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
    }

    // Check if the new selection matches a preset
    const newStart = !tempStartDate || (tempStartDate && tempEndDate) ? date : tempStartDate;
    const newEnd = tempStartDate && !tempEndDate && date !== tempStartDate ? (date < tempStartDate ? tempStartDate : date) : null;
    const matchedPreset = checkPresetMatch(newStart, newEnd);
    setSelectedPreset(matchedPreset);
  };

  // Handle Apply button
  const handleApply = () => {
    if (tempStartDate) {
      onSelectDateRange(tempStartDate, tempEndDate);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle Clear button
  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectedPreset('custom');
  };

  // Render a calendar
  const renderCalendar = (days: typeof leftDays, month: number, year: number, isLeft: boolean) => {
    return (
      <div style={{ width: '300px' }}>
        {/* Month/Year header */}
        <div className="flex items-center justify-between mb-4">
          {isLeft ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevYear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <KeyboardDoubleArrowLeftOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeftOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
              </button>
            </div>
          ) : (
            <div style={{ width: '64px' }} />
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: '#252525' }}>
              {monthNames[month]}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#252525' }}>
              {year}
            </span>
          </div>

          {!isLeft ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRightOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
              </button>
              <button
                onClick={handleNextYear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <KeyboardDoubleArrowRightOutlined sx={{ fontSize: 16, color: '#6B7280' }} />
              </button>
            </div>
          ) : (
            <div style={{ width: '64px' }} />
          )}
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2" style={{ columnGap: '8px', rowGap: '8px' }}>
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
          {days.map((day, index) => {
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

            const isSelected = isSameDay(day.fullDate, tempStartDate) || isSameDay(day.fullDate, tempEndDate);
            const isInRange = isDateBetween(day.fullDate, tempStartDate, tempEndDate);
            const isRangeStart = isSameDay(day.fullDate, tempStartDate) && tempEndDate;
            const isRangeEnd = isSameDay(day.fullDate, tempEndDate) && tempStartDate;

            // Check if date is at the start or end of a week row
            const isStartOfWeek = index % 7 === 0;
            const isEndOfWeek = index % 7 === 6;

            return (
              <div
                key={index}
                className="relative"
                style={{
                  width: '36px',
                  height: '36px',
                }}
              >
                {/* Extended background for in-range dates */}
                {isInRange && (
                  <div
                    className="absolute top-0 bottom-0 bg-[#F5F5F5]"
                    style={{
                      left: isRangeStart || isStartOfWeek ? '0' : '-4px',
                      right: isRangeEnd || isEndOfWeek ? '0' : '-4px',
                    }}
                  />
                )}
                {/* Extended background for range start that continues right */}
                {isRangeStart && !isEndOfWeek && (
                  <div
                    className="absolute top-0 bottom-0 bg-[#F5F5F5]"
                    style={{
                      left: '36px',
                      right: '-4px',
                    }}
                  />
                )}
                {/* Extended background for range end that continues left */}
                {isRangeEnd && !isStartOfWeek && (
                  <div
                    className="absolute top-0 bottom-0 bg-[#F5F5F5]"
                    style={{
                      left: '-4px',
                      right: '36px',
                    }}
                  />
                )}
                <button
                  onClick={() => handleDateClick(day.fullDate)}
                  className={`
                    relative z-10 text-center text-xs font-normal transition-colors
                    ${isSelected ? 'bg-[#252525] text-white font-semibold rounded' : ''}
                    ${isInRange ? 'text-[#252525]' : ''}
                    ${!isSelected && !isInRange ? 'text-[#252525] hover:bg-[#F5F5F5] rounded' : ''}
                  `}
                  style={{
                    width: '36px',
                    height: '36px',
                  }}
                >
                  {day.date}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const daysSelected = getDaysBetween(tempStartDate, tempEndDate);

  return (
    <div className="bg-white rounded-lg shadow-lg" style={{ border: '1px solid #E3E3E3' }}>
      <div className="flex">
        {/* Presets sidebar */}
        <div className="border-r border-gray-200 p-2" style={{ width: '160px' }}>
          <div className="space-y-1">
            <button
              onClick={() => handlePresetClick('today')}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between text-[#252525] hover:bg-[#F5F5F5]"
            >
              Today
              {selectedPreset === 'today' && <CheckOutlined sx={{ fontSize: 16, color: '#252525' }} />}
            </button>

            <button
              onClick={() => handlePresetClick('yesterday')}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between text-[#252525] hover:bg-[#F5F5F5]"
            >
              Yesterday
              {selectedPreset === 'yesterday' && <CheckOutlined sx={{ fontSize: 16, color: '#252525' }} />}
            </button>

            <button
              onClick={() => handlePresetClick('last7days')}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between text-[#252525] hover:bg-[#F5F5F5]"
            >
              Last 7 days
              {selectedPreset === 'last7days' && <CheckOutlined sx={{ fontSize: 16, color: '#252525' }} />}
            </button>

            <button
              onClick={() => handlePresetClick('last30days')}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between text-[#252525] hover:bg-[#F5F5F5]"
            >
              Last 30 days
              {selectedPreset === 'last30days' && <CheckOutlined sx={{ fontSize: 16, color: '#252525' }} />}
            </button>

            <button
              onClick={() => handlePresetClick('custom')}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between text-[#252525] hover:bg-[#F5F5F5]"
            >
              Custom
              {selectedPreset === 'custom' && <CheckOutlined sx={{ fontSize: 16, color: '#252525' }} />}
            </button>
          </div>
        </div>

        {/* Calendar section */}
        <div className="flex flex-col">
          {/* Start/End date inputs - only show for custom */}
          {selectedPreset === 'custom' && (
            <div className="px-4 pt-4 pb-4">
              <div className="flex gap-4">
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
                    Start
                  </label>
                  <input
                    type="text"
                    value={formatDateForInput(tempStartDate)}
                    readOnly
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    style={{ color: '#252525', backgroundColor: '#FAFAFA', width: '173px' }}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
                    End
                  </label>
                  <input
                    type="text"
                    value={formatDateForInput(tempEndDate)}
                    readOnly
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    style={{ color: '#252525', backgroundColor: '#FAFAFA', width: '173px' }}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dual calendar view */}
          <div className="flex gap-4 p-4">
            {renderCalendar(leftDays, leftMonth, leftYear, true)}
            <div style={{ width: '1px', backgroundColor: '#E3E3E3', alignSelf: 'stretch' }} />
            {renderCalendar(rightDays, rightCalendar.month, rightCalendar.year, false)}
          </div>

          {/* Footer with days selected and buttons */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
            <div className="text-sm" style={{ color: '#252525' }}>
              {tempStartDate && tempEndDate && daysSelected > 0 ? (
                <>
                  <span className="font-semibold">{daysSelected}</span> day{daysSelected !== 1 ? 's' : ''} selected
                </>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ color: '#252525' }}
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#252525' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
