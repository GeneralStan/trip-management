'use client';

import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface FilterCategoryListProps {
  activeCategory: 'deliveryType' | 'dispatcher';
  onSelectCategory: (category: 'deliveryType' | 'dispatcher') => void;
  deliveryType: string;
  selectedDispatchers: string[];
  onClearDispatchers: (e: React.MouseEvent) => void;
}

export default function FilterCategoryList({
  activeCategory,
  onSelectCategory,
  deliveryType,
  selectedDispatchers,
  onClearDispatchers,
}: FilterCategoryListProps) {
  return (
    <div
      className="w-[200px] border-r flex flex-col"
      style={{ borderColor: '#E3E3E3' }}
    >
      {/* Delivery Type Category */}
      <button
        onClick={() => onSelectCategory('deliveryType')}
        className="flex items-center justify-between px-4 py-4 text-left transition-colors"
        style={{
          backgroundColor: activeCategory === 'deliveryType' ? '#E0F2FE' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (activeCategory !== 'deliveryType') {
            e.currentTarget.style.backgroundColor = '#F5F5F5';
          }
        }}
        onMouseLeave={(e) => {
          if (activeCategory !== 'deliveryType') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-sm font-semibold" style={{ color: '#252525' }}>
            Delivery Type
          </div>
          {/* Delivery Type Chip - always visible, no × button */}
          <div
            className="inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium self-start"
            style={{
              backgroundColor: '#E0F2FE',
              color: '#252525',
              border: '1px solid #3B82F6',
            }}
          >
            {deliveryType}
          </div>
        </div>
        <ChevronRightOutlined
          sx={{ fontSize: 16, color: '#6B7280', marginLeft: 1 }}
        />
      </button>

      {/* Dispatcher Category */}
      <button
        onClick={() => onSelectCategory('dispatcher')}
        className="flex items-center justify-between px-4 py-4 text-left transition-colors"
        style={{
          backgroundColor: activeCategory === 'dispatcher' ? '#E0F2FE' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (activeCategory !== 'dispatcher') {
            e.currentTarget.style.backgroundColor = '#F5F5F5';
          }
        }}
        onMouseLeave={(e) => {
          if (activeCategory !== 'dispatcher') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-sm font-semibold" style={{ color: '#252525' }}>
            Dispatcher
          </div>
          {/* Dispatcher Chip - only visible when selections exist, with × button */}
          {selectedDispatchers.length > 0 && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium self-start"
              style={{
                backgroundColor: '#E0F2FE',
                color: '#252525',
                border: '1px solid #3B82F6',
              }}
            >
              <span>{selectedDispatchers.length} selected</span>
              <button
                onClick={onClearDispatchers}
                className="flex items-center justify-center hover:bg-white/50 rounded-full transition-colors"
                style={{ width: '16px', height: '16px' }}
                aria-label="Clear dispatcher selections"
              >
                <CloseRounded sx={{ fontSize: 14, color: '#252525' }} />
              </button>
            </div>
          )}
        </div>
        <ChevronRightOutlined
          sx={{ fontSize: 16, color: '#6B7280', marginLeft: 1 }}
        />
      </button>
    </div>
  );
}
