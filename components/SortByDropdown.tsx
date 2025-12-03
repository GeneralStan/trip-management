'use client';

import NorthOutlined from '@mui/icons-material/NorthOutlined';
import SouthOutlined from '@mui/icons-material/SouthOutlined';

interface SortByDropdownProps {
  selectedOption: string;
  selectedOrder: 'asc' | 'desc';
  onSelectOption: (option: string) => void;
  onSelectOrder: (order: 'asc' | 'desc') => void;
}

const sortOptions = [
  { value: 'Orders', label: 'Orders' },
  { value: 'Outlets', label: 'Outlets' },
  { value: 'Volume', label: 'Volume' },
];

export default function SortByDropdown({
  selectedOption,
  selectedOrder,
  onSelectOption,
  onSelectOrder,
}: SortByDropdownProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-lg py-2"
      style={{
        width: '200px',
        border: '1px solid #E3E3E3',
      }}
    >
      {/* Sort Options */}
      <div className="pb-2 mb-2" style={{ borderBottom: '1px solid #E3E3E3' }}>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelectOption(option.value)}
            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="relative flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
              {/* Outer circle */}
              <div
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: selectedOption === option.value ? '#3B82F6' : '#D1D5DB',
                }}
              />
              {/* Inner filled circle */}
              {selectedOption === option.value && (
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3B82F6',
                  }}
                />
              )}
            </div>
            <span className="text-sm font-normal" style={{ color: '#252525' }}>
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Sort Order */}
      <div className="px-2 space-y-2">
        <button
          onClick={() => onSelectOrder('asc')}
          className={`w-full px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
            selectedOrder === 'asc'
              ? 'bg-[#E0F2FE] border-[#3B82F6]'
              : 'border-transparent hover:bg-[#F5F5F5]'
          }`}
        >
          <NorthOutlined
            sx={{
              fontSize: 16,
              color: selectedOrder === 'asc' ? '#3B82F6' : '#6B7280',
            }}
          />
          <span
            className="text-sm font-normal"
            style={{
              color: selectedOrder === 'asc' ? '#3B82F6' : '#252525',
            }}
          >
            Low - High
          </span>
        </button>

        <button
          onClick={() => onSelectOrder('desc')}
          className={`w-full px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
            selectedOrder === 'desc'
              ? 'bg-[#E0F2FE] border-[#3B82F6]'
              : 'border-transparent hover:bg-[#F5F5F5]'
          }`}
        >
          <SouthOutlined
            sx={{
              fontSize: 16,
              color: selectedOrder === 'desc' ? '#3B82F6' : '#6B7280',
            }}
          />
          <span
            className="text-sm font-normal"
            style={{
              color: selectedOrder === 'desc' ? '#3B82F6' : '#252525',
            }}
          >
            High - Low
          </span>
        </button>
      </div>
    </div>
  );
}
