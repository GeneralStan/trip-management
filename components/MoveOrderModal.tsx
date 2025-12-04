'use client';

import { useState, useEffect, useRef } from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import type { Order, Trip } from '@/types';

const VEHICLE_CAPACITY = 860; // cubes

interface MoveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
  currentTrip: Trip | null;
  availableTrips: Trip[];
  onMoveOrder: (targetTrip: Trip) => void;
}

interface CapacityWarning {
  show: boolean;
  overage: number;
  newCapacityUsage: number;
}

export function MoveOrderModal({
  isOpen,
  onClose,
  selectedOrder,
  currentTrip,
  availableTrips,
  onMoveOrder,
}: MoveOrderModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [capacityWarning, setCapacityWarning] = useState<CapacityWarning | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter trips by delivery type (same as current trip)
  const sameDeliveryTypeTrips = availableTrips.filter(
    trip => trip.deliveryType === currentTrip?.deliveryType
  );

  // Sort trips by capacity available (most space first)
  const sortedTrips = [...sameDeliveryTypeTrips].sort((a, b) => {
    const aAvailable = VEHICLE_CAPACITY - a.totalVolume;
    const bAvailable = VEHICLE_CAPACITY - b.totalVolume;
    return bAvailable - aAvailable; // Descending order (most space first)
  });

  // Filter trips by search query
  const filteredTrips = sortedTrips.filter(trip => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      trip.tripNumber.toLowerCase().includes(query) ||
      trip.subRegion.toLowerCase().includes(query) ||
      trip.deliveryType.toLowerCase().includes(query)
    );
  });

  // Calculate capacity warning when trip is selected
  useEffect(() => {
    if (selectedTrip && selectedOrder) {
      const newTotalVolume = selectedTrip.totalVolume + selectedOrder.cubes;
      const overage = newTotalVolume - VEHICLE_CAPACITY;

      if (overage > 0) {
        setCapacityWarning({
          show: true,
          overage: Math.round(overage),
          newCapacityUsage: Math.round((newTotalVolume / VEHICLE_CAPACITY) * 100),
        });
      } else {
        setCapacityWarning(null);
      }
    } else {
      setCapacityWarning(null);
    }
  }, [selectedTrip, selectedOrder]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setSearchQuery('');
    setSelectedTrip(null);
    setCapacityWarning(null);
    onClose();
  };

  const handleTripClick = (trip: Trip) => {
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(null); // Deselect if clicking same trip
    } else {
      setSelectedTrip(trip);
    }
  };

  const handleMove = () => {
    if (selectedTrip) {
      onMoveOrder(selectedTrip);
      handleClose();
    }
  };

  if (!isOpen || !selectedOrder || !currentTrip) {
    return null;
  }

  const hasNoTrips = filteredTrips.length === 0;
  const isMoveDisabled = !selectedTrip;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="bg-white rounded-[10px] shadow-xl w-[480px] max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4" style={{ borderBottom: '1px solid #E3E3E3' }}>
          <div className="flex items-center justify-between">
            <h2
              id="modal-title"
              className="text-2xl font-semibold leading-8"
              style={{ color: '#0D0D0D' }}
            >
              Move to another trip
            </h2>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded transition-colors"
              style={{ backgroundColor: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              aria-label="Close modal"
            >
              <CloseRounded sx={{ fontSize: 24, color: '#252525' }} />
            </button>
          </div>
        </div>

        {/* Body Section */}
        <div className="px-4 pt-4">
          {/* Capacity Warning Banner (appears after selection) */}
          {capacityWarning?.show && (
            <div className="mb-6 flex items-start gap-4 rounded-[10px]" style={{ backgroundColor: '#FFF8EB', border: '1px solid #FB8500', padding: '12px 16px' }}>
              <div className="flex items-start py-1">
                <WarningAmberOutlined sx={{ fontSize: 20, color: '#FB8500' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base leading-6" style={{ color: '#0D0D0D' }}>
                  Vehicle Limit
                </div>
                <div className="text-sm leading-4 mt-1" style={{ color: '#101010' }}>
                  The vehicle will carry {capacityWarning.overage} cubes over capacity for this trip.
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <p className={`text-base leading-6 ${capacityWarning?.show ? '' : 'mt-2'}`} style={{ color: '#2F2F2F' }}>
            Select a trip below and move Order <span className="font-semibold">#{selectedOrder.id}</span> to it's delivery route.
          </p>
        </div>

        {/* Search Field */}
        <div className="px-4 pt-4 pb-0">
          <div className="relative">
            <SearchOutlined sx={{ fontSize: 16, color: '#9CA3AF', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search trip number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[10px] border py-3 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none placeholder:text-gray-500 text-gray-900 caret-gray-900"
              style={{ backgroundColor: '#FAFAFA', borderColor: '#E3E3E3' }}
            />
          </div>
        </div>

        {/* Trip List */}
        <div className="h-[217px] overflow-x-clip overflow-y-auto px-4 py-4">
          {hasNoTrips ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: '#808080' }}>
                {searchQuery.trim()
                  ? 'No trips found matching your search'
                  : 'No other trips available with the same delivery type'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-5">
              {filteredTrips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id;
                const availableCapacity = VEHICLE_CAPACITY - trip.totalVolume;

                return (
                  <div
                    key={trip.id}
                    onClick={() => handleTripClick(trip)}
                    className="flex items-center gap-3 rounded-[8px] cursor-pointer transition-all h-[76px]"
                    style={{
                      backgroundColor: '#FEFEFE',
                      border: isSelected ? '1px solid #080A12' : '1px solid #E3E3E3',
                      padding: '16px'
                    }}
                  >
                    {/* Color Indicator */}
                    <div
                      className="w-[18px] h-[18px] rounded flex-shrink-0"
                      style={{ backgroundColor: trip.color }}
                    />

                    {/* Trip Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base leading-6" style={{ color: '#0D0D0D' }}>
                        {trip.tripNumber}
                      </div>
                      <div className="text-xs leading-4 mt-1 flex items-center gap-2 flex-wrap" style={{ color: '#4D4D4D' }}>
                        <span>{trip.totalOrders} Orders</span>
                        <span>•</span>
                        <span>{trip.totalVolume} Cubes</span>
                        <span>•</span>
                        <span>{trip.capacityUsage}% Capacity</span>
                      </div>
                    </div>

                    {/* Checkmark */}
                    {isSelected && (
                      <CheckOutlined sx={{ fontSize: 24, color: '#0D0D0D' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 flex items-center justify-end gap-2" style={{ borderTop: '1px solid #E3E3E3' }}>
          <button
            onClick={handleClose}
            className="px-4 py-3 rounded-[10px] font-semibold text-sm leading-4 transition-colors"
            style={{
              backgroundColor: '#FEFEFE',
              border: '1px solid #E3E3E3',
              color: '#0D0D0D'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isMoveDisabled}
            className="px-4 py-3 rounded-[12px] font-semibold text-sm leading-4 flex items-center gap-2 transition-all"
            style={{
              backgroundColor: isMoveDisabled ? '#E3E3E3' : '#080A12',
              color: isMoveDisabled ? '#808080' : '#FAFAFA',
              opacity: isMoveDisabled ? 0.6 : 1,
              cursor: isMoveDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            <span>Move</span>
            <ArrowForwardOutlined sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
