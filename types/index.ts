export type DeliveryType = 'CORE' | 'JARS' | 'KEGS' | 'MECHA' | 'EXPRESS';

export interface Order {
  id: string;
  outletName: string;
  address: string;
  city: string;
  cubes: number;
  coordinates: [number, number]; // [latitude, longitude]
  deliverySequence: number; // 1, 2, 3, etc.
  gridNumber: string;
  plannedRoute: string;
}

export interface Trip {
  id: string;
  tripNumber: string;
  subRegion: string; // Sub region in Mauritius
  color: string; // hex color for the route
  deliveryType: DeliveryType;
  orders: Order[];
  totalOrders: number;
  totalVolume: number;
  capacityUsage: number; // percentage
  vehicleCapacity: number;
  isSelected?: boolean; // For UI state - indicates if trip card is selected
  dispatcher: string;
  dispatcherRoute: string;
  date: string; // YYYY-MM-DD format
  stringId: string; // e.g., "104" - first 3 digits of trip number
}

export interface MoveToRouteState {
  isActive: boolean;
  selectedOrder: Order | null;
  selectedTrip: Trip | null;
}

export interface DepotLocation {
  name: string;
  coordinates: [number, number];
}

export const VEHICLE_CAPACITY = 860; // cubes
