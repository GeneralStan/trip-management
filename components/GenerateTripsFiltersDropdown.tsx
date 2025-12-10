'use client';

import { useEffect, useState, useRef } from 'react';
import { Trip } from '@/types';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface GenerateTripsFiltersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    stringIds: string[];
    tripNumbers: string[];
  };
  onApplyFilters: (filters: { stringIds: string[]; tripNumbers: string[] }) => void;
  availableStringIds: string[];
  availableTrips: Trip[];
  buttonRect: DOMRect | null;
}

type FilterCategory = 'string' | 'tripNumber';

export default function GenerateTripsFiltersDropdown({
  isOpen,
  onClose,
  appliedFilters,
  onApplyFilters,
  availableStringIds,
  availableTrips,
  buttonRect,
}: GenerateTripsFiltersDropdownProps) {
  const [pendingFilters, setPendingFilters] = useState(appliedFilters);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('string');
  const [resultCount, setResultCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tripNumberOptions = ['Trip 1', 'Trip 2', 'Trip 3'];

  // Calculate dropdown position based on button location
  const getDropdownPosition = () => {
    if (!buttonRect) return { top: 0, left: 0 };

    return {
      top: buttonRect.bottom + 8, // 8px gap (mt-2)
      left: buttonRect.left,
    };
  };

  const position = getDropdownPosition();

  // Copy applied → pending when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setPendingFilters(appliedFilters);
      setActiveCategory('string');
    }
  }, [isOpen, appliedFilters]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Debounced result count calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      const count = calculateResultCount(pendingFilters, availableTrips);
      setResultCount(count);
    }, 300);
    return () => clearTimeout(timer);
  }, [pendingFilters, availableTrips]);

  const calculateResultCount = (
    filters: { stringIds: string[]; tripNumbers: string[] },
    trips: Trip[]
  ): number => {
    return trips.filter(trip => {
      // Filter by stringIds if selected
      if (filters.stringIds.length > 0) {
        const stringId = trip.tripNumber.substring(0, 3);
        if (!filters.stringIds.includes(stringId)) {
          return false;
        }
      }

      // Filter by tripNumbers if selected
      if (filters.tripNumbers.length > 0) {
        // Extract last 2 digits and convert to "Trip N" format
        const lastTwoDigits = trip.tripNumber.substring(3);
        let tripNumber = '';
        if (lastTwoDigits === '01') tripNumber = 'Trip 1';
        else if (lastTwoDigits === '02') tripNumber = 'Trip 2';
        else if (lastTwoDigits === '03') tripNumber = 'Trip 3';

        if (!filters.tripNumbers.includes(tripNumber)) {
          return false;
        }
      }

      return true;
    }).length;
  };

  const handleStringIdToggle = (stringId: string) => {
    const newStringIds = pendingFilters.stringIds.includes(stringId)
      ? pendingFilters.stringIds.filter(id => id !== stringId)
      : [...pendingFilters.stringIds, stringId];
    setPendingFilters({ ...pendingFilters, stringIds: newStringIds });
  };

  const handleTripNumberToggle = (tripNumber: string) => {
    const newTripNumbers = pendingFilters.tripNumbers.includes(tripNumber)
      ? pendingFilters.tripNumbers.filter(num => num !== tripNumber)
      : [...pendingFilters.tripNumbers, tripNumber];
    setPendingFilters({ ...pendingFilters, tripNumbers: newTripNumbers });
  };

  const handleClearStringIds = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingFilters({ ...pendingFilters, stringIds: [] });
  };

  const handleClearTripNumbers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingFilters({ ...pendingFilters, tripNumbers: [] });
  };

  const handleReset = () => {
    setPendingFilters({
      stringIds: [],
      tripNumbers: [],
    });
  };

  const handleShowResults = () => {
    onApplyFilters(pendingFilters);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white rounded-lg shadow-xl fixed"
      style={{
        width: '480px',
        height: '360px',
        border: '1px solid #E3E3E3',
        display: 'flex',
        flexDirection: 'column',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left column: Category list */}
        <div className="border-r p-4 gap-4 flex flex-col" style={{ width: '200px', borderColor: '#E3E3E3' }}>
          {/* String Filter Option */}
          <button
            onClick={() => setActiveCategory('string')}
            className="flex items-start justify-between text-left transition-colors w-full"
            style={{
              padding: '12px 8px',
              backgroundColor: activeCategory === 'string' ? '#FFFFFF' : 'transparent',
              border: activeCategory === 'string' ? '1px solid #252525' : '1px solid #E3E3E3',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'string') {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'string') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div className="flex flex-col gap-1 flex-1">
              <div
                className="text-sm font-semibold leading-5"
                style={{ color: '#252525' }}
              >
                String
              </div>
              {pendingFilters.stringIds.length > 0 && (
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-medium self-start"
                  style={{
                    padding: '2px 8px',
                    height: '20px',
                    backgroundColor: '#EBF4FF',
                    color: '#0669CC',
                    border: '1px solid #9CCDFF',
                    borderRadius: '4px',
                  }}
                >
                  <span>{pendingFilters.stringIds.length} selected</span>
                  <button
                    onClick={handleClearStringIds}
                    className="flex items-center justify-center hover:bg-white/50 rounded-full transition-colors"
                    style={{ width: '16px', height: '16px' }}
                    aria-label="Clear string ID selections"
                  >
                    <CloseRounded sx={{ fontSize: 14, color: '#0669CC' }} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ alignSelf: 'flex-start', marginTop: '0px' }}>
                <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Trip Number Filter Option */}
          <button
            onClick={() => setActiveCategory('tripNumber')}
            className="flex items-start justify-between text-left transition-colors w-full"
            style={{
              padding: '12px 8px',
              backgroundColor: activeCategory === 'tripNumber' ? '#FFFFFF' : 'transparent',
              border: activeCategory === 'tripNumber' ? '1px solid #252525' : '1px solid #E3E3E3',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'tripNumber') {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'tripNumber') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div className="flex flex-col gap-1 flex-1">
              <div
                className="text-sm font-semibold leading-5"
                style={{ color: '#252525' }}
              >
                Trip Number
              </div>
              {pendingFilters.tripNumbers.length > 0 && (
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-medium self-start"
                  style={{
                    padding: '2px 8px',
                    height: '20px',
                    backgroundColor: '#EBF4FF',
                    color: '#0669CC',
                    border: '1px solid #9CCDFF',
                    borderRadius: '4px',
                  }}
                >
                  <span>{pendingFilters.tripNumbers.length} selected</span>
                  <button
                    onClick={handleClearTripNumbers}
                    className="flex items-center justify-center hover:bg-white/50 rounded-full transition-colors"
                    style={{ width: '16px', height: '16px' }}
                    aria-label="Clear trip number selections"
                  >
                    <CloseRounded sx={{ fontSize: 14, color: '#0669CC' }} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ alignSelf: 'flex-start', marginTop: '0px' }}>
                <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Right column: Checkbox Options */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeCategory === 'string' ? (
            <div className="space-y-2">
              {availableStringIds.length > 0 ? (
                availableStringIds.map((stringId) => (
                  <label
                    key={stringId}
                    className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pendingFilters.stringIds.includes(stringId)}
                      onChange={() => handleStringIdToggle(stringId)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm" style={{ color: '#252525' }}>
                      {stringId}
                    </span>
                  </label>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                  No String IDs available
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {tripNumberOptions.map((tripNumber) => (
                <label
                  key={tripNumber}
                  className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={pendingFilters.tripNumbers.includes(tripNumber)}
                    onChange={() => handleTripNumberToggle(tripNumber)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm" style={{ color: '#252525' }}>
                    {tripNumber}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-4 border-t"
        style={{ borderColor: '#E3E3E3' }}
      >
        <div className="text-sm" style={{ color: '#252525' }}>
          <span className="font-semibold">{resultCount}</span> {resultCount === 1 ? 'result' : 'results'}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleShowResults}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#080A12' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1d2e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#080A12'}
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
