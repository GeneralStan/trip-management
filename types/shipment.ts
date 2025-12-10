export interface ShipmentOrder {
    "string": string,
    capacity: number,
    delivery_type: string,
    order_count: number,
    dispatcher: string,
  // id: string;
  // stringId: string;
  // driver: string;
  // deliveryDate: string;
  // orders: number;
  // outlets: number;
  // deliveryType: 'CORE' | 'JARS' | 'KEGS' | 'MECHA' | 'EXPRESS';
  // volume: number;
  // volumeCrates: number;
  status: 'Pending' | 'Finalized';
}

export interface ShipmentTrip {
  id: string;
  tripId: string;
  driver: string;
  orders: number;
  outlets: number;
  volume: number;
  volumeCrates: number;
  capacityUsage: string;
  deliveryType: 'CORE' | 'JARS' | 'KEGS' | 'MECHA' | 'EXPRESS';
  plannedDistance: string;
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
}

export type OrderFilterTab = 'pending' | 'finalized' | 'all';
export type TripFilterTab = 'pending' | 'in-transit' | 'completed' | 'cancelled';
