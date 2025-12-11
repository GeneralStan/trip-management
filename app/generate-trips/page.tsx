'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Order, Trip} from '@/types';
import {DEPOT, MAP_CENTER, mockTrips} from '@/lib/mockData';
import {calculateCapacityUsage} from '@/lib/utils';
import {getStorageItem, setStorageItem, STORAGE_KEYS} from '@/lib/storage';
import {TripCard} from '@/components/TripCard';
import {MapView} from '@/components/MapView';
import {Sidebar} from '@/components/Sidebar';
import {Toast} from '@/components/Toast';
import {MoveOrderModal} from '@/components/MoveOrderModal';
import {ConfirmDiscardModal} from '@/components/ConfirmDiscardModal';
import GenerateTripsFiltersDropdown from '@/components/GenerateTripsFiltersDropdown';
import Portal from '@/components/Portal';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import {saveSolveService} from "@/services/REST";

export default function TripManagementPage() {
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoadingTrips, setIsLoadingTrips] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<{ order: Order; trip: Trip } | null>(null);

    // Load trips from IndexedDB on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            getStorageItem<Trip[]>(STORAGE_KEYS.GENERATED_TRIPS)
                .then(savedTrips => {
                    if (savedTrips && Array.isArray(savedTrips)) {
                        setTrips(savedTrips);
                    }
                })
                .catch(e => {
                    console.error('Failed to load trips from storage:', e);
                })
                .finally(() => {
                    setIsLoadingTrips(false);
                });
        } else {
            setIsLoadingTrips(false);
        }
    }, []);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [orderToMove, setOrderToMove] = useState<{
        order: Order;
        sourceTrip: Trip;
    } | null>(null);
    const [panToLocation, setPanToLocation] = useState<{
        lat: number;
        lng: number;
        zoom?: number;
        timestamp?: number
    } | null>(null);
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        description?: string;
        onUndo?: () => void;
    }>({
        show: false,
        message: '',
    });
    const [lastMove, setLastMove] = useState<{
        order: Order;
        sourceTrip: Trip;
        targetTrip: Trip;
    } | null>(null);
    const [isApprovingTrips, setIsApprovingTrips] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // More Filters state
    const [showMoreFiltersDropdown, setShowMoreFiltersDropdown] = useState(false);
    const [filterState, setFilterState] = useState<{
        stringIds: string[];
        tripNumbers: string[];
    }>({
        stringIds: [],
        tripNumbers: [],
    });
    const [moreFiltersButtonRef, setMoreFiltersButtonRef] = useState<HTMLButtonElement | null>(null);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

    // Generate trips on component mount
    useEffect(() => {
    }, []);

    // Update button rect when dropdown opens or window resizes
    useEffect(() => {
        // if (showMoreFiltersDropdown && moreFiltersButtonRef) {
        //   setButtonRect(moreFiltersButtonRef.getBoundingClientRect());
        // }

        const handleResize = () => {
            if (showMoreFiltersDropdown && moreFiltersButtonRef) {
                setButtonRect(moreFiltersButtonRef.getBoundingClientRect());
            }
        };
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showMoreFiltersDropdown, moreFiltersButtonRef]);

    // Extract unique String IDs from trips (first 3 digits of trip ID)
    const availableStringIds = useMemo(() => {
        const stringIds = new Set<string>();
        trips.forEach(trip => {
            const stringId = trip.tripNumber.substring(0, 3);
            stringIds.add(stringId);
        });
        return Array.from(stringIds).sort();
    }, [trips]);

    // Filter trips based on filters and search query
    const filteredTrips = trips.filter(trip => {
        // Apply String ID filter
        if (filterState.stringIds.length > 0) {
            const stringId = trip.tripNumber.substring(0, 3);
            if (!filterState.stringIds.includes(stringId)) {
                return false;
            }
        }

        // Apply Trip Number filter
        if (filterState.tripNumbers.length > 0) {
            const lastTwoDigits = trip.tripNumber.substring(3);
            let tripNumber = '';
            if (lastTwoDigits === '01') tripNumber = 'Trip 1';
            else if (lastTwoDigits === '02') tripNumber = 'Trip 2';
            else if (lastTwoDigits === '03') tripNumber = 'Trip 3';

            if (!filterState.tripNumbers.includes(tripNumber)) {
                return false;
            }
        }

        return true;
    }).map(trip => {
        // Apply search query to trip and orders
        if (!searchQuery.trim()) return trip;

        const searchLower = searchQuery.toLowerCase();

        // Check if trip ID matches
        const tripMatches = trip.tripNumber.toLowerCase().includes(searchLower);

        // If trip ID matches, return all orders
        if (tripMatches) return trip;

        // Otherwise filter orders by outlet name, order ID, or address
        const filtered = trip.orders.filter(order =>
            order.outletName.toLowerCase().includes(searchLower) ||
            order.id.toLowerCase().includes(searchLower) ||
            order.address.toLowerCase().includes(searchLower)
        );

        if (filtered.length === 0) return null;

        return {...trip, orders: filtered, totalOrders: filtered.length};
    }).filter(Boolean) as Trip[];

    const hasSearchResults = searchQuery.trim() ? filteredTrips.some(trip => trip.orders.length > 0) : true;

    const handleOrderClick = (order: Order, trip: Trip, shouldPan: boolean = false) => {
        // Handle both selection and deselection (null values)
        setSelectedOrder(order && trip ? {order, trip} : null);

        // Only pan if explicitly requested (e.g., from sidebar clicks) and we have valid coordinates
        if (shouldPan && order?.coordinates) {
            setPanToLocation({
                lat: order.coordinates[0],
                lng: order.coordinates[1],
                zoom: 17,
                timestamp: Date.now() // Force unique trigger on every click
            });
        }
    };

    const handleMoveToRoute = () => {
        if (selectedOrder) {
            setOrderToMove({
                order: selectedOrder.order,
                sourceTrip: selectedOrder.trip,
            });
            setIsMoveModalOpen(true);
            setSelectedOrder(null); // Close tooltip
        }
    };

    const handleMoveFromModal = (targetTrip: Trip) => {
        if (!orderToMove) return;

        performMoveOrder(orderToMove.order, orderToMove.sourceTrip, targetTrip);
    };

    const performMoveOrder = (order: Order, sourceTrip: Trip, targetTrip: Trip) => {
        // Save the move for undo functionality
        setLastMove({
            order,
            sourceTrip,
            targetTrip,
        });

        const updatedTrips = trips.map((trip) => {
            // Remove order from source trip
            if (trip.id === sourceTrip.id) {
                const newOrders = trip.orders.filter((o) => o.id !== order.id);
                const newVolume = newOrders.reduce((sum, o) => sum + o.cubes, 0);
                return {
                    ...trip,
                    orders: newOrders.map((order, index) => ({
                        ...order,
                        deliverySequence: index + 1,
                    })),
                    totalOrders: newOrders.length,
                    totalVolume: newVolume,
                    capacityUsage: calculateCapacityUsage(newVolume,trip.vehicleCapacity),
                };
            }

            // Add order to target trip
            if (trip.id === targetTrip.id) {
                // Check if order ID already exists in target trip
                const orderIdExists = trip.orders.some((o) => o.id === order.id);

                // Generate new unique order ID if there's a conflict
                let newOrderId = order.id;
                if (orderIdExists) {
                    // Generate a new unique ID by finding the highest existing ID and incrementing
                    const allOrderIds = trip.orders.map((o) => parseInt(o.id, 10)).filter((id) => !isNaN(id));
                    const maxId = allOrderIds.length > 0 ? Math.max(...allOrderIds) : 0;
                    newOrderId = String(maxId + 1).padStart(4, '0');
                }

                const newOrders = [
                    ...trip.orders,
                    {
                        ...order,
                        id: newOrderId,
                        deliverySequence: trip.orders.length + 1,
                    },
                ];
                const newVolume = newOrders.reduce((sum, o) => sum + o.cubes, 0);
                return {
                    ...trip,
                    orders: newOrders,
                    totalOrders: newOrders.length,
                    totalVolume: newVolume,
                    capacityUsage: calculateCapacityUsage(newVolume,trip.vehicleCapacity),
                };
            }

            return trip;
        });

        setTrips(updatedTrips);
        setIsMoveModalOpen(false);
        setOrderToMove(null);
        setSelectedOrder(null);

        // Show toast notification
        setToast({
            show: true,
            message: `Order ${order.id} moved`,
            description: `The order has been moved to Trip ${targetTrip.tripNumber}`,
            onUndo: handleUndoMove,
        });
    };

    const handleUndoMove = () => {
        if (!lastMove) return;

        const {order, sourceTrip, targetTrip} = lastMove;

        const updatedTrips = trips.map((trip) => {
            // Remove order from target trip
            if (trip.id === targetTrip.id) {
                const newOrders = trip.orders.filter((o) => o.id !== order.id);
                const newVolume = newOrders.reduce((sum, o) => sum + o.cubes, 0);
                return {
                    ...trip,
                    orders: newOrders.map((order, index) => ({
                        ...order,
                        deliverySequence: index + 1,
                    })),
                    totalOrders: newOrders.length,
                    totalVolume: newVolume,
                    capacityUsage: calculateCapacityUsage(newVolume,trip.vehicleCapacity),
                };
            }

            // Add order back to source trip
            if (trip.id === sourceTrip.id) {
                const newOrders = [...trip.orders, order];
                const newVolume = newOrders.reduce((sum, o) => sum + o.cubes, 0);
                return {
                    ...trip,
                    orders: newOrders.map((order, index) => ({
                        ...order,
                        deliverySequence: index + 1,
                    })),
                    totalOrders: newOrders.length,
                    totalVolume: newVolume,
                    capacityUsage: calculateCapacityUsage(newVolume,trip.vehicleCapacity),
                };
            }

            return trip;
        });

        setTrips(updatedTrips);
        setLastMove(null);
    };

    const handleApproveTrips = async () => {
        setIsApprovingTrips(true);

        // Save trips to backend
        const res = await saveSolveService(trips);

        if (res.success) {
            // Store toast data for shipments page to show
            if (typeof window !== 'undefined') {
                await setStorageItem(STORAGE_KEYS.APPROVAL_TOAST, {
                    status: 'success' as const,
                    message: 'Trips approved',
                    description: `${trips.length} trips have been created.`,
                });
            }
            // Navigate to trips section
            router.push('/shipments?tab=trips');
        } else {
            // Handle error case
            setIsApprovingTrips(false);
            setToast({
                show: true,
                message: 'Failed to approve trips',
                description: res.error || 'An error occurred while saving trips.',
            });
        }
    };

    const deliveryType = trips[0]?.deliveryType || 'CORE';

    // Show loading state while loading from storage or generating
    if (isLoading || isLoadingTrips) {
        return (
            <div className="flex h-screen w-screen bg-gray-50">
                <Sidebar activeItem="trips"/>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                        <p className="text-gray-600">{isLoadingTrips ? 'Loading trips...' : 'Generating trips...'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            {/* Navigation Sidebar */}
            <Sidebar activeItem="trips"/>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1">
                {/* Page Header */}
                <header className="border-b border-gray-200 bg-white px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDiscardModal(true)}
                            className="rounded-md p-1 hover:bg-gray-100"
                            aria-label="Go back"
                        >
                            <ArrowBackOutlined sx={{fontSize: 20, color: '#374151'}}/>
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-900">Generate Trips</h1>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside
                        className={`${isSidebarCollapsed ? 'w-0' : 'w-[530px]'} flex flex-col border-r border-gray-200 bg-white transition-all duration-300 overflow-hidden relative z-[100]`}>
                        {/* Header */}
                        <div className="border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col gap-0.5">
                                    <h2 className="text-xl font-bold text-gray-900">Trips ({trips.length})</h2>
                                    <p className="text-sm text-gray-600">Preview and approve generated trips.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 border border-gray-300"
                                        title="Collapse sidebar"
                                    >
                                        <ChevronLeftOutlined sx={{fontSize: 20, color: '#374151'}}/>
                                    </button>
                                </div>
                            </div>

                            {/* Search and More Filters */}
                            <div className="flex items-center gap-3 mt-4">
                                {/* Search Bar - Full Width */}
                                <div className="relative flex-1">
                                    <SearchOutlined sx={{
                                        fontSize: 16,
                                        color: '#9CA3AF',
                                        position: 'absolute',
                                        left: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}/>
                                    <input
                                        type="text"
                                        placeholder="Search outlet, order ID or Trip ID"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none placeholder:text-gray-500 text-gray-900 caret-gray-900"
                                        style={{backgroundColor: '#FAFAFA', borderColor: '#E3E3E3'}}
                                    />
                                </div>

                                {/* More Filters Button */}
                                <div>
                                    <button
                                        ref={setMoreFiltersButtonRef}
                                        onClick={() => setShowMoreFiltersDropdown(!showMoreFiltersDropdown)}
                                        className="px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                        style={{color: '#252525'}}
                                    >
                                        <FilterListOutlined sx={{fontSize: 16, color: '#374151'}}/>
                                        <span>More Filters{(filterState.stringIds.length > 0 || filterState.tripNumbers.length > 0) ? ` (${filterState.stringIds.length + filterState.tripNumbers.length})` : ''}</span>
                                        <ExpandMoreOutlined
                                            sx={{
                                                fontSize: 16,
                                                color: '#374151',
                                                transform: showMoreFiltersDropdown ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.2s'
                                            }}
                                        />
                                    </button>
                                    {showMoreFiltersDropdown && (
                                        <Portal>
                                            <GenerateTripsFiltersDropdown
                                                isOpen={showMoreFiltersDropdown}
                                                onClose={() => setShowMoreFiltersDropdown(false)}
                                                appliedFilters={filterState}
                                                onApplyFilters={(filters) => {
                                                    setFilterState(filters);
                                                    setShowMoreFiltersDropdown(false);
                                                }}
                                                availableStringIds={availableStringIds}
                                                availableTrips={trips}
                                                buttonRect={buttonRect}
                                            />
                                        </Portal>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trip Cards or Empty State */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {hasSearchResults ? (
                                filteredTrips.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} onOrderClick={handleOrderClick}/>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="mb-4">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mx-auto">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="m21 21-4.35-4.35"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                                    <p className="text-sm text-gray-600 max-w-sm">
                                        We could not find any outlets matching &ldquo;<span
                                        className="font-medium">{searchQuery}</span>&rdquo;. Try searching with a
                                        different keyword.
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Map View */}
                    <main className="flex-1 relative">
                        {/* Expand Button (when sidebar is collapsed) */}
                        {isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="absolute left-4 top-4 z-[1000] rounded-md p-2 bg-white border border-gray-300 shadow-lg hover:bg-gray-50"
                                title="Expand sidebar"
                            >
                                <ChevronRightOutlined sx={{fontSize: 20, color: '#374151'}}/>
                            </button>
                        )}

                        <MapView
                            trips={filteredTrips}
                            depot={DEPOT}
                            center={MAP_CENTER}
                            selectedOrder={selectedOrder}
                            onOrderClick={handleOrderClick}
                            onMoveToRoute={handleMoveToRoute}
                            sidebarCollapsed={isSidebarCollapsed}
                            panToLocation={panToLocation}
                        />
                    </main>
                </div>

                {/* Footer - Outside sidebar, always visible */}
                <footer className="border-t border-gray-200 bg-white px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => setShowDiscardModal(true)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <ArrowBackOutlined sx={{fontSize: 16}}/>
                            Back to Orders
                        </button>
                        <button
                            onClick={handleApproveTrips}
                            disabled={isApprovingTrips}
                            className="rounded-md bg-gray-900 px-3 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isApprovingTrips ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                         fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckOutlined sx={{fontSize: 20}}/>
                                    Approve Trips
                                </>
                            )}
                        </button>
                    </div>
                </footer>

                {/* Move Order Modal */}
                <MoveOrderModal
                    isOpen={isMoveModalOpen}
                    onClose={() => {
                        setIsMoveModalOpen(false);
                        setOrderToMove(null);
                    }}
                    selectedOrder={orderToMove?.order || null}
                    currentTrip={orderToMove?.sourceTrip || null}
                    availableTrips={trips.filter(t => t.id !== orderToMove?.sourceTrip.id)}
                    onMoveOrder={handleMoveFromModal}
                />

                {/* Toast Notification */}
                <Toast
                    message={toast.message}
                    description={toast.description}
                    isVisible={toast.show}
                    onClose={() => setToast({...toast, show: false})}
                    onUndo={toast.onUndo}
                />

                {/* Discard Confirmation Modal */}
                <ConfirmDiscardModal
                    isOpen={showDiscardModal}
                    onClose={() => setShowDiscardModal(false)}
                    onConfirm={() => {
                        setShowDiscardModal(false);
                        router.push('/shipments?tab=orders');
                    }}
                />
            </div>
        </div>
    );
}
