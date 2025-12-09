'use client';

import { useEffect, useState, useRef } from 'react';
import { OrderFilterTab, TripFilterTab } from '@/types/shipment';
import { mockOrders, mockTrips } from '@/lib/mockShipments';
import FilterCategoryList from './FilterCategoryList';
import DeliveryTypeOptions from './DeliveryTypeOptions';
import DispatcherOptions from './DispatcherOptions';

interface MoreFiltersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    deliveryType: string;
    dispatchers: string[];
  };
  onApplyFilters: (filters: { deliveryType: string; dispatchers: string[] }) => void;
  availableDispatchers: string[];
  orderFilterTab: OrderFilterTab;
  tripFilterTab?: TripFilterTab;
  currentTab: 'orders' | 'trips';
}

type FilterCategory = 'deliveryType' | 'dispatcher';

export default function MoreFiltersDropdown({
  isOpen,
  onClose,
  appliedFilters,
  onApplyFilters,
  availableDispatchers,
  orderFilterTab,
  tripFilterTab,
  currentTab,
}: MoreFiltersDropdownProps) {
  const [pendingFilters, setPendingFilters] = useState(appliedFilters);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('deliveryType');
  const [resultCount, setResultCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Copy applied → pending when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setPendingFilters(appliedFilters);
      setActiveCategory('deliveryType');
    }
  }, [isOpen, appliedFilters]);

  // Debounced result count calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      const count = calculateResultCount(pendingFilters, orderFilterTab, tripFilterTab, currentTab);
      setResultCount(count);
    }, 300);
    return () => clearTimeout(timer);
  }, [pendingFilters, orderFilterTab, tripFilterTab, currentTab]);

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

  const calculateResultCount = (
    filters: { deliveryType: string; dispatchers: string[] },
    orderTab: OrderFilterTab,
    tripTab: TripFilterTab | undefined,
    tab: 'orders' | 'trips'
  ): number => {
    if (tab === 'orders') {
      return mockOrders
        .filter(order => {
          // Status filter
          if (orderTab === 'pending') return order.status === 'Pending';
          if (orderTab === 'finalized') return order.status === 'Finalized';
          return true; // 'all'
        })
        .filter(order => order.deliveryType === filters.deliveryType)
        .filter(order => {
          // Dispatcher filter (OR logic)
          if (filters.dispatchers.length === 0) return true;
          return filters.dispatchers.includes(order.driver);
        })
        .length;
    } else {
      return mockTrips
        .filter(trip => {
          // Status filter
          if (tripTab === 'pending') return trip.status === 'Pending';
          if (tripTab === 'in-transit') return trip.status === 'In Transit';
          if (tripTab === 'completed') return trip.status === 'Completed';
          if (tripTab === 'cancelled') return trip.status === 'Cancelled';
          return true;
        })
        .filter(trip => trip.deliveryType === filters.deliveryType)
        .filter(trip => {
          // Dispatcher filter (OR logic)
          if (filters.dispatchers.length === 0) return true;
          return filters.dispatchers.includes(trip.driver);
        })
        .length;
    }
  };

  const handleDeliveryTypeChange = (type: string) => {
    setPendingFilters({ ...pendingFilters, deliveryType: type });
  };

  const handleDispatcherToggle = (dispatcher: string) => {
    const newDispatchers = pendingFilters.dispatchers.includes(dispatcher)
      ? pendingFilters.dispatchers.filter(d => d !== dispatcher)
      : [...pendingFilters.dispatchers, dispatcher];
    setPendingFilters({ ...pendingFilters, dispatchers: newDispatchers });
  };

  const handleClearDispatchers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingFilters({ ...pendingFilters, dispatchers: [] });
  };

  const handleReset = () => {
    setPendingFilters({
      deliveryType: 'CORE',
      dispatchers: [],
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
        <FilterCategoryList
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          deliveryType={pendingFilters.deliveryType}
          selectedDispatchers={pendingFilters.dispatchers}
          onClearDispatchers={handleClearDispatchers}
        />

        {/* Right column: Options */}
        <div className="flex-1 overflow-y-auto">
          {activeCategory === 'deliveryType' ? (
            <DeliveryTypeOptions
              selectedType={pendingFilters.deliveryType}
              onSelectType={handleDeliveryTypeChange}
            />
          ) : (
            <DispatcherOptions
              selectedDispatchers={pendingFilters.dispatchers}
              onToggleDispatcher={handleDispatcherToggle}
              availableDispatchers={availableDispatchers}
            />
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
    </div>
  );
}
