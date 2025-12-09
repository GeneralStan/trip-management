'use client';

import { useState } from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

interface DispatcherOptionsProps {
  selectedDispatchers: string[];
  onToggleDispatcher: (dispatcher: string) => void;
  availableDispatchers: string[];
}

export default function DispatcherOptions({
  selectedDispatchers,
  onToggleDispatcher,
  availableDispatchers,
}: DispatcherOptionsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter dispatchers based on search query
  const filteredDispatchers = availableDispatchers.filter(dispatcher =>
    dispatcher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col px-4 pt-4">
      {/* Search Input */}
      <div className="relative mb-4">
        <SearchOutlined
          sx={{
            fontSize: 16,
            color: '#9CA3AF',
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
        <input
          type="text"
          placeholder="Search dispatcher"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border py-2 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none placeholder:text-gray-500 text-gray-900 caret-gray-900"
          style={{ backgroundColor: '#FAFAFA', borderColor: '#E3E3E3' }}
        />
      </div>

      {/* Scrollable Checkbox List */}
      <div className="flex-1 overflow-y-auto">
        {filteredDispatchers.length > 0 ? (
          filteredDispatchers.map((dispatcher) => (
            <label
              key={dispatcher}
              className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDispatchers.includes(dispatcher)}
                onChange={() => onToggleDispatcher(dispatcher)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm" style={{ color: '#252525' }}>
                {dispatcher}
              </span>
            </label>
          ))
        ) : (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500">
            No dispatchers found
          </div>
        )}
      </div>
    </div>
  );
}
