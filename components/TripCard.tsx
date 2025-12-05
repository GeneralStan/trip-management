'use client';

import { Trip, Order } from '@/types';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlined from '@mui/icons-material/ExpandLessOutlined';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { useState } from 'react';

interface TripCardProps {
  trip: Trip;
  onOrderClick?: (order: Order, trip: Trip) => void;
}

export function TripCard({ trip, onOrderClick }: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-lg border border-gray-200 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Accordion Header */}
      <div className="border-b border-gray-200 p-4 relative" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="flex items-center justify-between">
          {/* Left: Trip number with color indicator and sub region */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: trip.color }}
                />
                <span className="font-semibold text-gray-900">{trip.tripNumber}</span>
              </div>
              <span className="text-xs text-gray-600 ml-5">{trip.subRegion}</span>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-6 text-sm">
            {/* Orders */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-base">
                <ReceiptLongOutlined sx={{ fontSize: 20, color: '#374151' }} />
                <span>{trip.totalOrders}</span>
              </div>
              <span className="text-xs text-gray-600">Orders</span>
            </div>

            {/* Volume */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-base">
                <Inventory2Outlined sx={{ fontSize: 20, color: '#374151' }} />
                <span>{trip.totalVolume}</span>
              </div>
              <span className="text-xs text-gray-600">Volume (Cubes)</span>
            </div>

            {/* Capacity Usage */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-base">
                <LocalShippingOutlined sx={{ fontSize: 20, color: '#374151' }} />
                <span>{trip.capacityUsage}%</span>
              </div>
              <span className="text-xs text-gray-600">Capacity Usage</span>
            </div>
          </div>

          {/* Right: Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ExpandLessOutlined sx={{ fontSize: 20, color: '#4B5563' }} />
            ) : (
              <ExpandMoreOutlined sx={{ fontSize: 20, color: '#4B5563' }} />
            )}
          </button>
        </div>

        {/* Check Icon - Top Right (conditionally shown when trip is selected) */}
        {trip.isSelected && (
          <CheckCircleRounded
            sx={{
              fontSize: 24,
              color: '#10B981',
              position: 'absolute',
              top: 16,
              right: 16
            }}
          />
        )}
      </div>

      {/* Accordion Content - Table */}
      {isExpanded && (
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#F3F4F6' }}>
              <tr className="text-left text-xs font-semibold text-gray-700 uppercase">
                <th className="p-3">Order ID</th>
                <th className="p-3">Outlet Name</th>
                <th className="p-3">Address</th>
                <th className="p-3 text-right">Cubes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {trip.orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors bg-white"
                  onClick={() => onOrderClick?.(order, trip)}
                >
                  <td className="p-3 font-semibold text-gray-900">{order.id}</td>
                  <td className="p-3 text-gray-900">{order.outletName}</td>
                  <td className="p-3 text-gray-700">{order.address}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">{order.cubes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
