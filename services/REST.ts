import {ServiceResponse} from "@/services/helpers";
import {OrderData, TripData} from "@/services/types";
import {ENDPOINTS} from '@/services/endpoints';
import {makeServiceCall} from '@/services/helpers';
import {ShipmentOrder, ShipmentTrip} from "@/types/shipment";
import {Trip, Order, DeliveryType} from "@/types";

interface GetDatesServiceResponse {
    dates: string[]
}

export async function getDatesService(): Promise<ServiceResponse<GetDatesServiceResponse>> {
    return makeServiceCall<{}, GetDatesServiceResponse>(ENDPOINTS.LIST_DATES);
}

interface SolveServiceRequest {
    date: string;
    strings: string[]
}

interface TripOrderData {
    // "address": "ROYAL ROAD",
    address: string
    // "capacity": 121.0,
    capacity: number
    // "city": "FLIC EN FLAC",
    city: string
    // "date": "2025-11-11",
    date: string
    // "delivery_type": "Jar",
    delivery_type: string
    // "dispatcher": "JMM",
    dispatcher: string
    // "dispatcher_route": "10103",
    dispatcher_route: string
    // "grid_number": "411105",
    grid_number: string
    // "latitude": -20.2789833,
    latitude: number
    // "longitude": 57.4041333,
    longitude: number
    // "outlet_code": "100492",
    outlet_code: string
    // "outlet_name": "SHELL FILLING STATION",
    outlet_name: string
    // "planned_route": "104",
    planned_route: string
    // "route_name": "20103",
    route_name: string
    // "string": "104",
    string: string
    // "trip_id": "20103"
    trip_id: string
}

interface RouteCapacityData {
    capacity_pct: number
    total_capacity: number
    vehicle_capacity: number
}

interface SolveServiceResponse {
    results: TripOrderData[]
    route_capacity: Record<string, RouteCapacityData>
}

function convertTripOrderDataToTrips(tripOrders: TripOrderData[], routeCapacity: Record<string, RouteCapacityData>): Trip[] {
    const tripMap: Record<string, {
        orders: Order[];
        deliveryType: DeliveryType;
        dispatcher: string;
        dispatcherRoute: string;
        date: string;
        stringId: string;
    }> = {};

    // Group orders by trip_id
    tripOrders.forEach((orderData) => {
        if (!tripMap[orderData.trip_id]) {
            tripMap[orderData.trip_id] = {
                orders: [],
                deliveryType: orderData.delivery_type.toUpperCase() as DeliveryType,
                dispatcher: orderData.dispatcher,
                dispatcherRoute: orderData.dispatcher_route,
                date: orderData.date,
                stringId: orderData.string,
            };
        }

        // Create Order from TripOrderData
        const order: Order = {
            id: orderData.outlet_code,
            outletName: orderData.outlet_name,
            address: orderData.address,
            city: orderData.city,
            cubes: orderData.capacity,
            coordinates: [orderData.latitude, orderData.longitude],
            deliverySequence: tripMap[orderData.trip_id].orders.length + 1,
            gridNumber: orderData.grid_number,
            plannedRoute: orderData.planned_route,
        };

        tripMap[orderData.trip_id].orders.push(order);
    });

    // Convert map to Trip array
    const tripEntries = Object.entries(tripMap);

    // Predefined distinct colors for trips
    const TRIP_COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84',
        '#6C5B7B', '#F67280', '#99B898', '#FECEAB', '#355C7D',
        '#2ECC71', '#E74C3C', '#3498DB', '#F39C12', '#9B59B6',
        '#1ABC9C', '#E67E22', '#34495E', '#16A085', '#D35400'
    ];

    return tripEntries.map(([tripId, tripData], index) => {
        // Use modulo to loop through colors if we have more trips than colors
        const color = TRIP_COLORS[index % TRIP_COLORS.length];

        return {
            id: tripId,
            tripNumber: tripId,
            subRegion: "",
            color: color,
            deliveryType: tripData.deliveryType,
            orders: tripData.orders,
            totalOrders: tripData.orders.length,
            vehicleCapacity: routeCapacity[tripId]?.vehicle_capacity || 0,
            totalVolume: routeCapacity[tripId]?.total_capacity || 0,
            capacityUsage: routeCapacity[tripId]?.capacity_pct || 0,
            isSelected: false,
            dispatcher: tripData.dispatcher,
            dispatcherRoute: tripData.dispatcherRoute,
            date: tripData.date,
            stringId: tripData.stringId,
        };
    });
}

function convertTripsToTripOrderData(trips: Trip[]): TripOrderData[] {
    const tripOrderData: TripOrderData[] = [];

    trips.forEach(trip => {
        trip.orders.forEach(order => {
            // Split coordinates back to lat/lng
            const [latitude, longitude] = order.coordinates;

            // Convert Trip and Order back to TripOrderData format
            const orderData: TripOrderData = {
                address: order.address,
                capacity: order.cubes,
                city: order.city,
                date: trip.date,
                delivery_type: trip.deliveryType.toLowerCase(),
                dispatcher: trip.dispatcher,
                dispatcher_route: trip.dispatcherRoute,
                grid_number: order.gridNumber,
                latitude: latitude,
                longitude: longitude,
                outlet_code: order.id,
                outlet_name: order.outletName,
                planned_route: order.plannedRoute,
                route_name: trip.tripNumber,
                string: trip.stringId,
                trip_id: trip.tripNumber
            };

            tripOrderData.push(orderData);
        });
    });

    return tripOrderData;
}

export async function solveService(request: SolveServiceRequest): Promise<ServiceResponse<Trip[]>> {
    const res = await makeServiceCall<SolveServiceRequest, SolveServiceResponse>(ENDPOINTS.SOLVE, request);
    if (!res.success) {
        return {
            data: [],
            success: false,
            error: res.error
        };
    }

    const trips: Trip[] = convertTripOrderDataToTrips(res.data?.results ?? [], res.data?.route_capacity ?? {});

    return {
        success: true,
        data: trips
    };
}


interface SaveSolveServiceRequest {
    results: TripOrderData[]
}

interface SaveSolveServiceResponse {
}

export async function saveSolveService(trips: Trip[]): Promise<ServiceResponse<SaveSolveServiceResponse>> {
    const request: SaveSolveServiceRequest = {
        results: convertTripsToTripOrderData(trips)
    }
    return makeServiceCall<SaveSolveServiceRequest, SaveSolveServiceResponse>(ENDPOINTS.SAVE_SOLVE, request);
}

interface SummaryTripData {
    // "customers": 9,
    customers: number,
    // "delivery_type": "jar",
    delivery_type: string,
    // "salesman": "RENGHEN SIVALINGUM ROOBEN",
    salesman: string,
    // "total_capacity": 192,
    total_capacity: number,
    // "trip_id": 10401
    trip_id: string
}

function summaryTripDataToShipmentTrip(data: SummaryTripData[]): ShipmentTrip[] {
    return data.map((trip) => ({
        id: trip.trip_id.toString(),
        tripId: trip.trip_id.toString(),
        driver: trip.salesman,
        orders: trip.customers,
        outlets: trip.customers,
        volume: trip.total_capacity,
        volumeCrates: 0,
        capacityUsage: "", // This can be calculated if needed
        deliveryType: trip.delivery_type.toUpperCase() as DeliveryType,
        plannedDistance: "", // This can be filled if data is available
        status: 'Pending' // Default status, can be modified based on requirements
    }));
}

interface GetSolveServiceResponse {
    results: ShipmentTrip[]
}

interface GetSolveSummaryServiceRequest {
    date: string
}


export async function getSolveSummaryService(request: GetSolveSummaryServiceRequest): Promise<ServiceResponse<GetSolveServiceResponse>> {
    const res = await makeServiceCall<GetSolveSummaryServiceRequest, {
        results: SummaryTripData[]
    }>(ENDPOINTS.SOLVE_SUMMARY, request);

    if (!res.success) {
        return {
            data: {results: []},
            success: false,
            error: res.error
        };
    }

    const shipmentTrips: ShipmentTrip[] = summaryTripDataToShipmentTrip(res.data?.results ?? []);

    return {
        success: true,
        data: {results: shipmentTrips}
    };
}

interface GetStringServiceRequest {
    date?: string,
    dispatcher?: string
    delivery_type?: string
}

interface GetStringServiceResponse {
    results: ShipmentOrder[]
    count: number
}

export async function getStringsService(request: GetStringServiceRequest): Promise<ServiceResponse<GetStringServiceResponse>> {
    return makeServiceCall<GetStringServiceRequest, GetStringServiceResponse>(ENDPOINTS.GET_STRINGS, request);
}

interface GetDispatchersServiceResponse {
    dispatchers: string[],
    delivery_types: string[]
}

export async function getDispatchersService(): Promise<ServiceResponse<GetDispatchersServiceResponse>> {
    return makeServiceCall<{}, GetDispatchersServiceResponse>(ENDPOINTS.GET_DISPATCHERS);
}
