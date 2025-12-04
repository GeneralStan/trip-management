'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, AlertTriangle, Check, ArrowRight } from 'lucide-react';
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
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              Move to another trip
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors -mr-2 -mt-2 p-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Select a trip below and move Order #{selectedOrder.id} to its delivery route.
          </p>
        </div>

        {/* Capacity Warning Banner (appears after selection) */}
        {capacityWarning?.show && (
          <div className="mx-6 mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-900 text-sm">
                Vehicle Limit
              </div>
              <div className="text-sm text-amber-800 mt-1">
                The vehicle will carry {capacityWarning.overage} cubes over capacity for this trip.
              </div>
            </div>
          </div>
        )}

        {/* Search Field */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search trip number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Trip List */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {hasNoTrips ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">
                {searchQuery.trim()
                  ? 'No trips found matching your search'
                  : 'No other trips available with the same delivery type'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {filteredTrips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id;
                const availableCapacity = VEHICLE_CAPACITY - trip.totalVolume;

                return (
                  <div
                    key={trip.id}
                    onClick={() => handleTripClick(trip)}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all
                      border-2
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                      }
                    `}
                  >
                    {/* Color Indicator */}
                    <div
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: trip.color }}
                    />

                    {/* Trip Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-base">
                        {trip.tripNumber}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{trip.totalOrders} Orders</span>
                        <span>•</span>
                        <span>{trip.totalVolume} Cubes</span>
                        <span>•</span>
                        <span>{trip.capacityUsage}% Capacity</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {availableCapacity > 0
                          ? `${availableCapacity} cubes available`
                          : `${Math.abs(availableCapacity)} cubes over capacity`
                        }
                      </div>
                    </div>

                    {/* Checkmark */}
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isMoveDisabled}
            className={`
              px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all
              ${isMoveDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
              }
            `}
          >
            <span>Move</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
