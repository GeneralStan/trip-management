'use client';

import { Order, Trip } from '@/types';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useEffect, useRef, useState } from 'react';

interface OrderTooltipProps {
  order: Order;
  trip: Trip;
  position: { x: number; y: number };
  onClose: () => void;
  onMoveToRoute: () => void;
}

export function OrderTooltip({
  order,
  trip,
  position,
  onClose,
  onMoveToRoute,
}: OrderTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipWidth = 280;
    const tooltipHeight = tooltip.offsetHeight || 220;
    const gap = 10; // Gap between pin and tooltip

    // Default position: centered above pin
    let left = position.x - tooltipWidth / 2;
    let top = position.y - tooltipHeight - gap;

    // Store original left position for maximum shift constraint
    const originalLeft = left;

    // Gentler boundary constraints with maximum shift limit
    const maxShift = 50; // Maximum pixels to shift from centered position
    const minEdgeGap = 5; // Smaller minimum edge distance

    // Left edge constraint with shift limit
    if (left < minEdgeGap) {
      left = Math.max(minEdgeGap, originalLeft - maxShift);
    }

    // Right edge constraint with shift limit
    if (left + tooltipWidth > window.innerWidth - minEdgeGap) {
      const idealLeft = window.innerWidth - tooltipWidth - minEdgeGap;
      left = Math.min(idealLeft, originalLeft + maxShift);
    }

    // Top edge constraint
    if (top < minEdgeGap) {
      top = minEdgeGap;
    }

    setCalculatedPosition({ left, top });
  }, [position]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[1000] w-[280px] rounded-lg bg-white shadow-2xl"
      style={{
        left: `${calculatedPosition.left}px`,
        top: `${calculatedPosition.top}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">Order {order.id}</h3>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded transition-colors"
          style={{ backgroundColor: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          aria-label="Close"
        >
          <CloseRounded sx={{ fontSize: 24, color: '#252525' }} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase">Trip Number</div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: trip.color }}
              />
              <div className="font-semibold text-sm text-gray-900">{trip.tripNumber}</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase">Delivery Type</div>
            <div className="font-semibold text-sm text-gray-900 mt-1">{trip.deliveryType}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase">Cubes</div>
            <div className="font-semibold text-sm text-gray-900 mt-1">{order.cubes}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase">Outlet Name</div>
            <div className="font-semibold text-sm text-gray-900 mt-1">{order.outletName}</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onMoveToRoute}
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Move to another trip
        </button>
      </div>

      {/* Caret pointing down to the pin */}
      <div
        className="absolute"
        style={{
          left: `${Math.max(10, Math.min(position.x - calculatedPosition.left - 10, 260))}px`,
          bottom: '-10px',
        }}
      >
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid white',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
          }}
        />
      </div>
    </div>
  );
}
