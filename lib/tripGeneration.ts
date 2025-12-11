import {Trip, Order} from '@/types';
import {calculateCapacityUsage} from './utils';

// Vehicle capacity in cubes
const VEHICLE_CAPACITY = 860;

// Color palette for trips (cycles through colors)
const TRIP_COLORS = [
    '#7C3AED',  // Purple
    '#EF4444',  // Red
    '#3B82F6',  // Blue
    '#10B981',  // Green
    '#F97316',  // Orange
    '#EC4899',  // Pink
    '#8B5CF6',  // Violet
    '#14B8A6',  // Teal
];

// Sub-regions for different String IDs (can be customized)
const SUB_REGIONS: { [key: string]: string } = {
    '101': 'La Porte Providence',
    '102': 'Belvedere',
    '103': "L'aventure",
    '104': 'Quatre Bornes',
    '105': 'Curepipe',
    '106': 'Rose Hill',
    '107': 'Beau Bassin',
    '108': 'Vacoas',
    '109': 'Phoenix',
    '110': 'Floreal',
    '111': 'Forest Side',
    '112': 'Stanley',
    '113': 'Bambous',
    '114': 'Midlands',
    '115': 'Cascavelle',
    // Add more as needed
};

// Generate outlet names (mock data)
const OUTLET_NAMES = [
    'Amina Bakeries',
    'Yanne Boutique',
    'Sunset Shop',
    'Metro Mart',
    'Phoenix Grocery',
    'Riverside Mart',
    'Central Supplies',
    'Corner Store',
    'Highland Market',
    'Town Center Shop',
    'Express Convenience',
    'Valley Grocers',
    'Peak Supplies',
];

// Generate addresses (mock data)
const ADDRESSES = [
    'Gladestone',
    'Quatre Bornes',
    'Curepipe',
    'Rose Hill',
    'Beau Bassin',
    'Vacoas',
    'Phoenix',
];

/**
 * Generate a mock order for a trip
 */
function generateMockOrder(
    orderId: string,
    sequenceNumber: number,
    stringId: string
): Order {
    // Generate coordinates around Mauritius center with some randomness
    const baseLat = -20.1609;
    const baseLng = 57.5012;
    const latOffset = (Math.random() - 0.5) * 0.02; // ~2km radius
    const lngOffset = (Math.random() - 0.5) * 0.02;

    // Random volume between 60 and 400 cubes
    const cubes = Math.floor(Math.random() * (400 - 60 + 1)) + 60;

    return {
        id: orderId,
        outletName: OUTLET_NAMES[Math.floor(Math.random() * OUTLET_NAMES.length)],
        address: ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)],
        city: "Mauritius",
        gridNumber: "1",
        plannedRoute: "test",
        cubes,
        coordinates: [baseLat + latOffset, baseLng + lngOffset],
        deliverySequence: sequenceNumber,
    };
}

/**
 * Generate trips for a given set of String IDs
 *
 * @param stringIds - Array of String IDs (e.g., ['101', '102', '103'])
 * @param deliveryType - Delivery type for all trips
 * @returns Array of generated trips
 */
export function generateTripsFromStringIds(
    stringIds: string[],
    deliveryType: 'CORE' | 'JARS' | 'KEGS' | 'MECHA' = 'CORE'
): Trip[] {
    const trips: Trip[] = [];
    let colorIndex = 0;
    let globalTripId = 1;

    // For each String ID, generate 3 trips
    stringIds.forEach((stringId) => {
        for (let tripNum = 1; tripNum <= 3; tripNum++) {
            // Generate trip ID: [StringID][TripNumber]
            // e.g., String 101 → 10101, 10102, 10103
            const tripNumber = `${stringId}${tripNum.toString().padStart(2, '0')}`;

            // Generate 3-5 orders per trip (random)
            const orderCount = Math.floor(Math.random() * 3) + 3; // 3-5 orders
            const orders: Order[] = [];
            let totalVolume = 0;

            for (let i = 0; i < orderCount; i++) {
                const orderId = String(globalTripId * 100 + i + 1).padStart(4, '0');
                const order = generateMockOrder(orderId, i + 1, stringId);
                orders.push(order);
                totalVolume += order.cubes;
            }

            // Get sub-region for this String ID (or use generic)
            const subRegion = SUB_REGIONS[stringId] || `Region ${stringId}`;

            // Create trip
            const trip: Trip = {
                id: String(globalTripId),
                tripNumber,
                subRegion,
                color: TRIP_COLORS[colorIndex % TRIP_COLORS.length],
                deliveryType,
                totalOrders: orderCount,
                totalVolume,
                capacityUsage: calculateCapacityUsage(totalVolume,800),
                date: new Date().toISOString().split('T')[0], // Today's date
                stringId: "test",
                vehicleCapacity: 800,
                dispatcher: "test",
                dispatcherRoute: "rest",
                isSelected: false,
                orders,
            };

            trips.push(trip);
            colorIndex++;
            globalTripId++;
        }
    });

    return trips;
}

/**
 * Get unique String IDs from an array of order IDs
 * This is used when orders are selected in the Shipments page
 *
 * @param orders - Array of ShipmentOrder objects
 * @param selectedOrderIds - Set of selected order IDs
 * @returns Array of unique String IDs
 */
export function extractStringIdsFromOrders(
    orders: { string: string }[],
    selectedOrderIds: Set<string>
): string[] {
    const stringIds = new Set<string>();

    selectedOrderIds.forEach((orderId) => {
        const order = orders.find((o) => o.string === orderId);
        if (order) {
            stringIds.add(order.string);
        }
    });

    return Array.from(stringIds).sort();
}

/**
 * Calculate summary statistics for generated trips
 */
export function calculateTripSummary(trips: Trip[]) {
    return {
        totalTrips: trips.length,
        totalOrders: trips.reduce((sum, trip) => sum + trip.totalOrders, 0),
        totalVolume: trips.reduce((sum, trip) => sum + trip.totalVolume, 0),
        averageCapacity: Math.round(
            trips.reduce((sum, trip) => sum + trip.capacityUsage, 0) / trips.length
        ),
        overCapacityTrips: trips.filter((trip) => trip.capacityUsage > 100).length,
    };
}
