'use client';

import { useEffect, useState, useRef } from 'react';

interface GenerateTripsFiltersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    stringIds: string[];
    tripNumbers: string[];
  };
  onApplyFilters: (filters: { stringIds: string[]; tripNumbers: string[] }) => void;
  availableStringIds: string[];
}

type FilterCategory = 'string' | 'tripNumber';

export default function GenerateTripsFiltersDropdown({
  isOpen,
  onClose,
  appliedFilters,
  onApplyFilters,
  availableStringIds,
}: GenerateTripsFiltersDropdownProps) {
  const [pendingFilters, setPendingFilters] = useState(appliedFilters);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('string');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tripNumberOptions = ['Trip 1', 'Trip 2', 'Trip 3'];

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
      className="bg-white rounded-lg shadow-xl"
      style={{
        width: '480px',
        height: '420px',
        border: '1px solid #E3E3E3',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Two-column layout */}
      <div className="flex" style={{ height: '360px' }}>
        {/* Left column: Category list */}
        <div className="border-r" style={{ width: '200px', borderColor: '#E3E3E3', height: '360px' }}>
          {/* String Filter Option */}
          <button
            onClick={() => setActiveCategory('string')}
            className="flex items-start justify-between text-left transition-colors w-full"
            style={{
              padding: '12px 8px',
              backgroundColor: activeCategory === 'string' ? '#FFFFFF' : 'transparent',
              border: activeCategory === 'string' ? '1px solid #252525' : '1px solid #E3E3E3',
              borderRadius: '8px',
              margin: '8px',
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
                  className="inline-flex items-center text-xs font-medium self-start"
                  style={{
                    padding: '2px 8px',
                    height: '20px',
                    backgroundColor: '#EBF4FF',
                    color: '#0669CC',
                    border: '1px solid #9CCDFF',
                    borderRadius: '4px',
                  }}
                >
                  {pendingFilters.stringIds.length}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pendingFilters.stringIds.length > 0 && (
                <button
                  onClick={handleClearStringIds}
                  className="text-xs font-medium underline hover:no-underline"
                  style={{ color: '#6B7280' }}
                >
                  Clear
                </button>
              )}
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
              margin: '8px',
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
                  className="inline-flex items-center text-xs font-medium self-start"
                  style={{
                    padding: '2px 8px',
                    height: '20px',
                    backgroundColor: '#EBF4FF',
                    color: '#0669CC',
                    border: '1px solid #9CCDFF',
                    borderRadius: '4px',
                  }}
                >
                  {pendingFilters.tripNumbers.length}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pendingFilters.tripNumbers.length > 0 && (
                <button
                  onClick={handleClearTripNumbers}
                  className="text-xs font-medium underline hover:no-underline"
                  style={{ color: '#6B7280' }}
                >
                  Clear
                </button>
              )}
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
        className="flex items-center justify-end px-4 py-4 border-t gap-3"
        style={{ borderColor: '#E3E3E3' }}
      >
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
  );
}
