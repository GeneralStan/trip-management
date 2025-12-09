'use client';

import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import SimpleDatePicker from '@/components/SimpleDatePicker';
import MoreFiltersDropdown from '@/components/MoreFiltersDropdown';
import SortByDropdown from '@/components/SortByDropdown';
import TripsSortByDropdown from '@/components/TripsSortByDropdown';
import { ShipmentOrder, ShipmentTrip, OrderFilterTab, TripFilterTab } from '@/types/shipment';
import { mockOrders, mockTrips } from '@/lib/mockShipments';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import NorthEastOutlined from '@mui/icons-material/NorthEastOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import ArrowDownwardOutlined from '@mui/icons-material/ArrowDownwardOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import { useRouter, useSearchParams } from 'next/navigation';

function ShipmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'summary' | 'orders' | 'trips'>('summary');
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    description?: string;
  }>({
    show: false,
    message: '',
  });

  // Delivery Type filter state
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('CORE');

  // Dispatcher filter state
  const [dispatcherFilters, setDispatcherFilters] = useState<string[]>([]);

  // More Filters dropdown state
  const [showMoreFiltersDropdown, setShowMoreFiltersDropdown] = useState(false);

  // Extract unique dispatchers from mock data
  const availableDispatchers = useMemo(() => {
    const dispatchers = new Set<string>();
    mockOrders.forEach(order => dispatchers.add(order.driver));
    mockTrips.forEach(trip => dispatchers.add(trip.driver));
    return Array.from(dispatchers).sort();
  }, []);

  // Set active tab and delivery type filter based on query parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const deliveryTypeParam = searchParams.get('deliveryType');
    const dispatchersParam = searchParams.get('dispatchers');

    if (tabParam === 'trips') {
      setActiveTab('trips');
    } else if (tabParam === 'orders') {
      setActiveTab('orders');
    } else if (tabParam === 'summary') {
      setActiveTab('summary');
    } else if (!tabParam) {
      // Default to summary if no tab parameter
      setActiveTab('summary');
    }

    if (deliveryTypeParam) {
      setDeliveryTypeFilter(deliveryTypeParam);
    }

    if (dispatchersParam) {
      setDispatcherFilters(dispatchersParam.split(',').filter(d => d.trim()));
    }
  }, [searchParams]);

  // Check for approval toast from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toastData = sessionStorage.getItem('showApprovalToast');
      if (toastData) {
        try {
          const parsedData = JSON.parse(toastData);
          // Show toast 100ms after page loads
          setTimeout(() => {
            setToast({
              show: true,
              message: parsedData.message,
              description: parsedData.description,
            });
          }, 100);
          // Clear the sessionStorage item
          sessionStorage.removeItem('showApprovalToast');
        } catch (e) {
          console.error('Failed to parse toast data:', e);
        }
      }
    }
  }, []);
  const [orderFilterTab, setOrderFilterTab] = useState<OrderFilterTab>('pending');
  const [tripFilterTab, setTripFilterTab] = useState<TripFilterTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [summarySearchQuery, setSummarySearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Date picker state - simple single date picker (defaults to current day + 2)
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(getDefaultDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSummaryDatePicker, setShowSummaryDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const summaryDatePickerRef = useRef<HTMLDivElement>(null);

  // More Filters dropdown ref
  const moreFiltersDropdownRef = useRef<HTMLDivElement>(null);

  // Sort by dropdown state for Orders
  const [sortByOption, setSortByOption] = useState('Volume');
  const [sortByOrder, setSortByOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortByDropdown, setShowSortByDropdown] = useState(false);
  const sortByDropdownRef = useRef<HTMLDivElement>(null);

  // Sort by dropdown state for Trips
  const [tripsSortByOption, setTripsSortByOption] = useState('Volume');
  const [tripsSortByOrder, setTripsSortByOrder] = useState<'asc' | 'desc'>('desc');
  const [showTripsSortByDropdown, setShowTripsSortByDropdown] = useState(false);
  const tripsSortByDropdownRef = useRef<HTMLDivElement>(null);

  // Refs for indeterminate checkboxes
  const ordersHeaderCheckboxRef = useRef<HTMLInputElement>(null);
  const tripsHeaderCheckboxRef = useRef<HTMLInputElement>(null);

  // Format date for display - simple single date format
  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return 'Select date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return 'Today';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    if (isTomorrow) return 'Tomorrow';

    // Format as dd/mm/yy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Handle click outside to close date pickers and dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (summaryDatePickerRef.current && !summaryDatePickerRef.current.contains(event.target as Node)) {
        setShowSummaryDatePicker(false);
      }
      if (moreFiltersDropdownRef.current && !moreFiltersDropdownRef.current.contains(event.target as Node)) {
        setShowMoreFiltersDropdown(false);
      }
      if (sortByDropdownRef.current && !sortByDropdownRef.current.contains(event.target as Node)) {
        setShowSortByDropdown(false);
      }
      if (tripsSortByDropdownRef.current && !tripsSortByDropdownRef.current.contains(event.target as Node)) {
        setShowTripsSortByDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter orders based on filter tab
  const filteredOrders = mockOrders.filter((order) => {
    if (orderFilterTab === 'pending') return order.status === 'Pending';
    if (orderFilterTab === 'finalized') return order.status === 'Finalized';
    return true; // 'all'
  }).filter((order) => {
    // Apply delivery type filter
    return order.deliveryType === deliveryTypeFilter;
  }).filter((order) => {
    // Apply dispatcher filter (OR logic)
    if (dispatcherFilters.length === 0) return true;
    return dispatcherFilters.includes(order.driver);
  }).filter((order) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      order.stringId.toLowerCase().includes(searchLower) ||
      order.driver.toLowerCase().includes(searchLower) ||
      order.deliveryType.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Apply sorting
    let valueA: number;
    let valueB: number;

    if (sortByOption === 'Orders') {
      valueA = a.orders;
      valueB = b.orders;
    } else if (sortByOption === 'Outlets') {
      valueA = a.outlets;
      valueB = b.outlets;
    } else { // Volume
      valueA = a.volume;
      valueB = b.volume;
    }

    if (sortByOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  // Filter trips based on filter tab
  const filteredTrips = mockTrips.filter((trip) => {
    if (tripFilterTab === 'pending') return trip.status === 'Pending';
    if (tripFilterTab === 'in-transit') return trip.status === 'In Transit';
    if (tripFilterTab === 'completed') return trip.status === 'Completed';
    if (tripFilterTab === 'cancelled') return trip.status === 'Cancelled';
    return true;
  }).filter((trip) => {
    // Apply delivery type filter
    return trip.deliveryType === deliveryTypeFilter;
  }).filter((trip) => {
    // Apply dispatcher filter (OR logic)
    if (dispatcherFilters.length === 0) return true;
    return dispatcherFilters.includes(trip.driver);
  }).filter((trip) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      trip.tripId.toLowerCase().includes(searchLower) ||
      trip.driver.toLowerCase().includes(searchLower) ||
      trip.deliveryType.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Apply sorting for trips
    let valueA: number;
    let valueB: number;

    if (tripsSortByOption === 'Orders') {
      valueA = a.orders;
      valueB = b.orders;
    } else if (tripsSortByOption === 'Outlets') {
      valueA = a.outlets;
      valueB = b.outlets;
    } else if (tripsSortByOption === 'Volume') {
      valueA = a.volume;
      valueB = b.volume;
    } else if (tripsSortByOption === 'Capacity Usage') {
      // Parse percentage string to number
      valueA = parseFloat(a.capacityUsage.replace('%', ''));
      valueB = parseFloat(b.capacityUsage.replace('%', ''));
    } else if (tripsSortByOption === 'Planned Distance') {
      // Parse distance string to number
      valueA = parseFloat(a.plannedDistance.replace(' Km', ''));
      valueB = parseFloat(b.plannedDistance.replace(' Km', ''));
    } else {
      valueA = a.volume;
      valueB = b.volume;
    }

    if (tripsSortByOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  // Pagination
  const currentData = activeTab === 'orders' ? filteredOrders : filteredTrips;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  const paginatedTrips = filteredTrips.slice(startIndex, startIndex + itemsPerPage);

  // Update indeterminate state for order checkboxes
  useEffect(() => {
    if (ordersHeaderCheckboxRef.current) {
      const isIndeterminate = selectedOrders.size > 0 && selectedOrders.size < paginatedOrders.length;
      ordersHeaderCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedOrders, paginatedOrders]);

  // Update indeterminate state for trip checkboxes
  useEffect(() => {
    if (tripsHeaderCheckboxRef.current) {
      const isIndeterminate = selectedTrips.size > 0 && selectedTrips.size < paginatedTrips.length;
      tripsHeaderCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedTrips, paginatedTrips]);

  // Counts for tabs
  const pendingOrdersCount = mockOrders.filter((o) => o.status === 'Pending').length;
  const finalizedOrdersCount = mockOrders.filter((o) => o.status === 'Finalized').length;
  const allOrdersCount = mockOrders.length;

  const pendingTripsCount = mockTrips.filter((t) => t.status === 'Pending').length;
  const inTransitTripsCount = mockTrips.filter((t) => t.status === 'In Transit').length;
  const completedTripsCount = mockTrips.filter((t) => t.status === 'Completed').length;
  const cancelledTripsCount = mockTrips.filter((t) => t.status === 'Cancelled').length;

  // Last updated timestamp for Summary
  const [lastUpdated] = useState(() => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  });

  // Summary calculations by delivery type
  const deliveryTypes = ['CORE', 'JARS', 'KEGS', 'MECHA'] as const;

  // Filter delivery types based on search query
  const filteredDeliveryTypes = deliveryTypes.filter((type) => {
    if (!summarySearchQuery.trim()) return true;
    return type.toLowerCase().includes(summarySearchQuery.toLowerCase());
  });

  const getSummaryForDeliveryType = (deliveryType: string) => {
    const orders = mockOrders.filter((order) => {
      const statusMatch = orderFilterTab === 'pending'
        ? order.status === 'Pending'
        : orderFilterTab === 'finalized'
        ? order.status === 'Finalized'
        : true;
      return order.deliveryType === deliveryType && statusMatch;
    });

    const totalOrders = orders.reduce((sum, order) => sum + order.orders, 0);
    const totalOutlets = orders.reduce((sum, order) => sum + order.outlets, 0);
    const totalCubes = orders.reduce((sum, order) => sum + order.volume, 0);
    const totalCases = orders.reduce((sum, order) => sum + order.volumeCrates, 0);

    return { totalOrders, totalOutlets, totalCubes, totalCases };
  };

  const handleViewAll = (deliveryType: string) => {
    router.push(`/shipments?tab=orders&deliveryType=${deliveryType}`);
  };

  // Selection handlers for orders
  const toggleSelectAllOrders = () => {
    if (selectedOrders.size === paginatedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map((o) => o.id)));
    }
  };

  const toggleSelectOrder = (id: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedOrders(newSelection);
  };

  const clearOrderSelections = () => {
    setSelectedOrders(new Set());
  };

  // Selection handlers for trips
  const toggleSelectAllTrips = () => {
    if (selectedTrips.size === paginatedTrips.length) {
      setSelectedTrips(new Set());
    } else {
      setSelectedTrips(new Set(paginatedTrips.map((t) => t.id)));
    }
  };

  const toggleSelectTrip = (id: string) => {
    const newSelection = new Set(selectedTrips);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTrips(newSelection);
  };

  const clearTripSelections = () => {
    setSelectedTrips(new Set());
  };

  const handleGenerateTrips = () => {
    // Navigate to Generate Trips screen
    router.push('/generate-trips');
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <Sidebar activeItem="trips" />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Shipments</h1>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-4">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab('summary');
                setCurrentPage(1);
              }}
              className={`pb-3 pt-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                setCurrentPage(1);
              }}
              className={`pb-3 pt-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => {
                setActiveTab('trips');
                setCurrentPage(1);
              }}
              className={`pb-3 pt-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'trips'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Trips
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 bg-white flex flex-col overflow-hidden" style={{ paddingTop: '20px', paddingBottom: activeTab !== 'summary' ? '16px' : '0' }}>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'summary' ? 'Summary' : activeTab === 'orders' ? 'Orders' : 'Trips'}
            </h2>
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileDownloadOutlined sx={{ fontSize: 16, color: '#374151' }} />
              {activeTab === 'summary' ? 'Download Summary' : activeTab === 'orders' ? 'Download Orders' : 'Download Trips'}
            </button>
          </div>

          {/* Filter Tabs */}
          {activeTab === 'summary' ? (
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setOrderFilterTab('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  orderFilterTab === 'pending'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pending
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  orderFilterTab === 'pending'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {pendingOrdersCount}
                </span>
              </button>
              <button
                onClick={() => setOrderFilterTab('finalized')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  orderFilterTab === 'finalized'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Finalized
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  orderFilterTab === 'finalized'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {finalizedOrdersCount}
                </span>
              </button>
            </div>
          ) : activeTab === 'orders' ? (
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setOrderFilterTab('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  orderFilterTab === 'pending'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pending
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  orderFilterTab === 'pending'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {pendingOrdersCount}
                </span>
              </button>
              <button
                onClick={() => setOrderFilterTab('finalized')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  orderFilterTab === 'finalized'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Finalized
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  orderFilterTab === 'finalized'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {finalizedOrdersCount}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setTripFilterTab('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  tripFilterTab === 'pending'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pending
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  tripFilterTab === 'pending'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {pendingTripsCount}
                </span>
              </button>
              <button
                onClick={() => setTripFilterTab('in-transit')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  tripFilterTab === 'in-transit'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                In Transit
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  tripFilterTab === 'in-transit'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {inTransitTripsCount}
                </span>
              </button>
              <button
                onClick={() => setTripFilterTab('completed')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  tripFilterTab === 'completed'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Completed
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  tripFilterTab === 'completed'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {completedTripsCount}
                </span>
              </button>
              <button
                onClick={() => setTripFilterTab('cancelled')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  tripFilterTab === 'cancelled'
                    ? 'bg-white text-gray-900 border-2 border-gray-900'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancelled
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                  tripFilterTab === 'cancelled'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {cancelledTripsCount}
                </span>
              </button>
            </div>
          )}

          {/* Search and Actions */}
          {activeTab !== 'summary' && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <SearchOutlined sx={{ fontSize: 16, color: '#9CA3AF', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none placeholder:text-gray-500 text-gray-900 caret-gray-900"
                style={{ backgroundColor: '#FAFAFA', borderColor: '#E3E3E3' }}
              />
            </div>
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <CalendarMonthRounded sx={{ fontSize: 16, color: '#374151' }} />
                Delivery Date: {formatDateDisplay(deliveryDate)}
              </button>
              {showDatePicker && (
                <div className="absolute top-full mt-2 z-50">
                  <SimpleDatePicker
                    selectedDate={deliveryDate}
                    onSelectDate={(date) => {
                      setDeliveryDate(date);
                      setShowDatePicker(false);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="relative" ref={moreFiltersDropdownRef}>
              <button
                onClick={() => setShowMoreFiltersDropdown(!showMoreFiltersDropdown)}
                className="px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                style={{ color: '#252525' }}
              >
                <FilterListOutlined sx={{ fontSize: 16, color: '#374151' }} />
                <span>More Filters</span>
                {dispatcherFilters.length > 0 && (
                  <span
                    className="inline-flex items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: '#3B82F6',
                      color: '#FFFFFF',
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 6px'
                    }}
                  >
                    {dispatcherFilters.length}
                  </span>
                )}
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
                <div className="absolute top-full mt-2 z-50">
                  <MoreFiltersDropdown
                    isOpen={showMoreFiltersDropdown}
                    onClose={() => setShowMoreFiltersDropdown(false)}
                    appliedFilters={{
                      deliveryType: deliveryTypeFilter,
                      dispatchers: dispatcherFilters,
                    }}
                    onApplyFilters={(filters) => {
                      setDeliveryTypeFilter(filters.deliveryType);
                      setDispatcherFilters(filters.dispatchers);
                      setShowMoreFiltersDropdown(false);
                      // Clear row selections when filter changes
                      setSelectedOrders(new Set());
                      setSelectedTrips(new Set());
                    }}
                    availableDispatchers={availableDispatchers}
                    orderFilterTab={orderFilterTab}
                    tripFilterTab={tripFilterTab}
                    currentTab={activeTab as 'orders' | 'trips'}
                  />
                </div>
              )}
            </div>
            {activeTab === 'orders' ? (
              <div className="relative" ref={sortByDropdownRef}>
                <button
                  onClick={() => setShowSortByDropdown(!showSortByDropdown)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  Sort By: {sortByOption}
                  <ArrowDownwardOutlined sx={{ fontSize: 16, color: '#374151', transform: sortByOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
                </button>
                {showSortByDropdown && (
                  <div className="absolute top-full mt-2 z-50">
                    <SortByDropdown
                      selectedOption={sortByOption}
                      selectedOrder={sortByOrder}
                      onSelectOption={setSortByOption}
                      onSelectOrder={setSortByOrder}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" ref={tripsSortByDropdownRef}>
                <button
                  onClick={() => setShowTripsSortByDropdown(!showTripsSortByDropdown)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  Sort By: {tripsSortByOption}
                  <ArrowDownwardOutlined sx={{ fontSize: 16, color: '#374151', transform: tripsSortByOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
                </button>
                {showTripsSortByDropdown && (
                  <div className="absolute top-full mt-2 z-50">
                    <TripsSortByDropdown
                      selectedOption={tripsSortByOption}
                      selectedOrder={tripsSortByOrder}
                      onSelectOption={setTripsSortByOption}
                      onSelectOrder={setTripsSortByOrder}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="flex-1"></div>
            {activeTab === 'orders' ? (
              <button
                onClick={handleGenerateTrips}
                disabled={selectedOrders.size === 0}
                className="rounded-md bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <NorthEastOutlined sx={{ fontSize: 20, color: 'white' }} />
                Generate Trips
              </button>
            ) : (
              <button
                disabled={selectedTrips.size === 0}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <NorthEastOutlined sx={{ fontSize: 16, color: '#374151' }} />
                Dispatch Trips
              </button>
            )}
          </div>
          )}

          {/* Selection Counter */}
          {activeTab === 'orders' ? (
            selectedOrders.size > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="text-sm font-semibold text-gray-900">
                  {selectedOrders.size} selected
                </div>
                <button
                  onClick={clearOrderSelections}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear selections
                </button>
              </div>
            )
          ) : (
            selectedTrips.size > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="text-sm font-semibold text-gray-900">
                  {selectedTrips.size} selected
                </div>
                <button
                  onClick={clearTripSelections}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear selections
                </button>
              </div>
            )
          )}

          {/* Summary Cards */}
          {activeTab === 'summary' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search and Filter for Summary - Sticky */}
              <div className="sticky top-0 bg-white z-10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <SearchOutlined sx={{ fontSize: 16, color: '#9CA3AF', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search delivery type"
                      value={summarySearchQuery}
                      onChange={(e) => setSummarySearchQuery(e.target.value)}
                      className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none placeholder:text-gray-500 text-gray-900 caret-gray-900"
                      style={{ backgroundColor: '#FAFAFA', borderColor: '#E3E3E3' }}
                    />
                  </div>
                  <div className="relative" ref={summaryDatePickerRef}>
                    <button
                      onClick={() => setShowSummaryDatePicker(!showSummaryDatePicker)}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CalendarMonthRounded sx={{ fontSize: 16, color: '#374151' }} />
                      Delivery Date: {formatDateDisplay(deliveryDate)}
                    </button>
                    {showSummaryDatePicker && (
                      <div className="absolute top-full mt-2 z-50">
                        <SimpleDatePicker
                          selectedDate={deliveryDate}
                          onSelectDate={(date) => {
                            setDeliveryDate(date);
                            setShowSummaryDatePicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto" style={{ scrollBehavior: 'smooth', overscrollBehaviorY: 'contain' }}>
                <div className="pb-5">
                {filteredDeliveryTypes.length > 0 ? (
                  filteredDeliveryTypes.map((deliveryType, index) => {
                  const summary = getSummaryForDeliveryType(deliveryType);
                  return (
                    <div key={deliveryType}>
                      <div className="bg-white py-4">
                        <div className="flex items-start">
                          {/* Left Column - Delivery Type Info */}
                          <div className="flex flex-col justify-between" style={{ width: '412px' }}>
                            <div>
                              <h3 className="text-sm font-bold mb-2" style={{ color: '#252525' }}>{deliveryType}</h3>
                              <p className="text-xs mb-7" style={{ color: '#6B7280' }}>Last Updated: {lastUpdated}</p>
                            </div>
                            <button
                              onClick={() => handleViewAll(deliveryType)}
                              className="text-xs font-normal flex items-center gap-1 underline self-start text-[#252525] hover:text-[#0883FF] active:text-[#0669CC] transition-colors"
                            >
                              View All
                              <NorthEastOutlined sx={{ fontSize: 12, color: 'currentColor' }} />
                            </button>
                          </div>

                          {/* Right Column - Metrics Grid */}
                          <div className="flex-1 grid grid-cols-4 gap-3">
                            <div className="rounded-md p-4 flex flex-col justify-center" style={{ backgroundColor: '#F5F5F5', height: '88px' }}>
                              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Orders</p>
                              <p className="text-xl font-bold" style={{ color: '#252525' }}>{summary.totalOrders}</p>
                            </div>
                            <div className="rounded-md p-4 flex flex-col justify-center" style={{ backgroundColor: '#F5F5F5', height: '88px' }}>
                              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Outlets</p>
                              <p className="text-xl font-bold" style={{ color: '#252525' }}>{summary.totalOutlets}</p>
                            </div>
                            <div className="rounded-md p-4 flex flex-col justify-center" style={{ backgroundColor: '#F5F5F5', height: '88px' }}>
                              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Cubes</p>
                              <p className="text-xl font-bold" style={{ color: '#252525' }}>{summary.totalCubes}</p>
                            </div>
                            <div className="rounded-md p-4 flex flex-col justify-center" style={{ backgroundColor: '#F5F5F5', height: '88px' }}>
                              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Cases</p>
                              <p className="text-xl font-bold" style={{ color: '#252525' }}>{summary.totalCases}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Divider between cards, except after the last one */}
                      {index < filteredDeliveryTypes.length - 1 && (
                        <div className="my-5" style={{ borderBottom: '1px solid #E3E3E3' }} />
                      )}
                    </div>
                  );
                })
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <SearchOutlined sx={{ fontSize: 48, color: '#9CA3AF', marginBottom: 2 }} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No delivery types found</h3>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search to find what you're looking for.
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>
          ) : (
            /* Table - Scrollable */
            <div className="flex-1 flex flex-col min-h-0 rounded-lg overflow-hidden" style={{ border: '1px solid #E3E3E3' }}>
              <div className="overflow-auto flex-1">
                {activeTab === 'orders' ? (
                <table className="w-full">
                  <thead className="sticky top-0 z-10" style={{ backgroundColor: '#EFEFEF', borderBottom: '1px solid #E3E3E3' }}>
                    <tr>
                      <th className="w-12 px-3 py-2.5" style={{ height: '52px', backgroundColor: '#EFEFEF' }}>
                        <div className="flex items-center">
                          <input
                            ref={ordersHeaderCheckboxRef}
                            type="checkbox"
                            checked={paginatedOrders.length > 0 && selectedOrders.size === paginatedOrders.length}
                            onChange={toggleSelectAllOrders}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>String ID</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Dispatcher</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Orders</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Outlets</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Volume (Cubes)</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Volume (Crates)</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Delivery Type</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #E3E3E3' }}>
                        <td className="px-3 py-2.5" style={{ height: '52px' }}>
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.stringId}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.driver}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.orders}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.outlets}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.volume}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.volumeCrates}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{order.deliveryType}</td>
                        <td className="px-3 py-2.5" style={{ height: '52px' }}>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 z-10" style={{ backgroundColor: '#EFEFEF', borderBottom: '1px solid #E3E3E3' }}>
                    <tr>
                      <th className="w-12 px-3 py-2.5" style={{ height: '52px', backgroundColor: '#EFEFEF' }}>
                        <div className="flex items-center">
                          <input
                            ref={tripsHeaderCheckboxRef}
                            type="checkbox"
                            checked={paginatedTrips.length > 0 && selectedTrips.size === paginatedTrips.length}
                            onChange={toggleSelectAllTrips}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Trip ID</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Driver</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Orders</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Outlets</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Volume (Cubes)</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Volume (Crates)</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Capacity Usage</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Planned Distance</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Delivery Type</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Status</th>
                      <th className="px-3 py-2.5 text-left text-sm font-semibold" style={{ height: '52px', color: '#252525', backgroundColor: '#EFEFEF' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {paginatedTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #E3E3E3' }}>
                        <td className="px-3 py-2.5" style={{ height: '52px' }}>
                          <input
                            type="checkbox"
                            checked={selectedTrips.has(trip.id)}
                            onChange={() => toggleSelectTrip(trip.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.tripId}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.driver}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.orders}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.outlets}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.volume}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.volumeCrates}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.capacityUsage}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.plannedDistance}</td>
                        <td className="px-3 py-2.5 text-sm" style={{ height: '52px', color: '#252525' }}>{trip.deliveryType}</td>
                        <td className="px-3 py-2.5" style={{ height: '52px' }}>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              trip.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : trip.status === 'In Transit'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : trip.status === 'Completed'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5" style={{ height: '52px' }}>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertOutlined sx={{ fontSize: 20, color: '#6B7280' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            </div>
          )}

          {/* Pagination */}
          {activeTab !== 'summary' && (
          <div className="flex items-center justify-end px-4 py-2 bg-white" style={{ borderTop: '1px solid #E3E3E3', gap: '16px' }}>
            <div className="text-sm" style={{ color: '#252525' }}>
              Showing {startIndex + 1} of {currentData.length}
            </div>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ width: '32px', height: '32px', borderRadius: '5px' }}
              >
                <ChevronLeftOutlined sx={{ fontSize: 16, color: '#252525' }} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center text-sm font-semibold transition-colors ${
                    page === currentPage ? '' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '5px',
                    backgroundColor: page === currentPage ? '#EDF5FF' : 'transparent',
                    border: page === currentPage ? '1px solid #0883FF' : 'none',
                    color: '#252525'
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ width: '32px', height: '32px', borderRadius: '5px' }}
              >
                <ChevronRightOutlined sx={{ fontSize: 16, color: '#252525' }} />
              </button>
            </div>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <select
                className="px-2 py-1.5 text-sm font-semibold bg-white focus:outline-none appearance-none"
                style={{
                  border: '1px solid #E3E3E3',
                  borderRadius: '5px',
                  color: '#252525',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23252525' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '32px'
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm" style={{ color: '#252525' }}>rows per page</span>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        description={toast.description}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}

export default function ShipmentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShipmentsContent />
    </Suspense>
  );
}
