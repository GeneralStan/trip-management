import { ShipmentOrder, ShipmentTrip } from '@/types/shipment';

export const mockOrders: ShipmentOrder[] = [
  // CORE - Pending
  // { id: '1', stringId: '101', driver: 'Jose Hardewa', deliveryDate: '13/04/24', orders: 8, outlets: 6, deliveryType: 'CORE', volume: 720, volumeCrates: Math.round(720 / 1.3), status: 'Pending' },
  // { id: '2', stringId: '102', driver: 'Albert Leriche', deliveryDate: '14/04/24', orders: 12, outlets: 9, deliveryType: 'CORE', volume: 1050, volumeCrates: Math.round(1050 / 1.3), status: 'Pending' },
  // { id: '3', stringId: '103', driver: 'Ify Kiplimo', deliveryDate: '13/04/24', orders: 5, outlets: 4, deliveryType: 'CORE', volume: 380, volumeCrates: Math.round(380 / 1.3), status: 'Pending' },
  // { id: '4', stringId: '104', driver: 'David Karanja', deliveryDate: '15/04/24', orders: 15, outlets: 12, deliveryType: 'CORE', volume: 1340, volumeCrates: Math.round(1340 / 1.3), status: 'Pending' },
  // { id: '5', stringId: '105', driver: 'Cheryll Onyango', deliveryDate: '13/04/24', orders: 3, outlets: 3, deliveryType: 'CORE', volume: 210, volumeCrates: Math.round(210 / 1.3), status: 'Pending' },
  //
  // // JARS - Pending
  // { id: '6', stringId: '106', driver: 'John Mwangi', deliveryDate: '14/04/24', orders: 10, outlets: 7, deliveryType: 'JARS', volume: 890, volumeCrates: Math.round(890 / 1.3), status: 'Pending' },
  // { id: '7', stringId: '107', driver: 'Benson Othieno', deliveryDate: '13/04/24', orders: 4, outlets: 3, deliveryType: 'JARS', volume: 320, volumeCrates: Math.round(320 / 1.3), status: 'Pending' },
  // { id: '8', stringId: '108', driver: 'Mungai Abrams', deliveryDate: '16/04/24', orders: 7, outlets: 5, deliveryType: 'JARS', volume: 560, volumeCrates: Math.round(560 / 1.3), status: 'Pending' },
  // { id: '9', stringId: '109', driver: 'Sarah Johnson', deliveryDate: '14/04/24', orders: 13, outlets: 10, deliveryType: 'JARS', volume: 1180, volumeCrates: Math.round(1180 / 1.3), status: 'Pending' },
  //
  // // KEGS - Pending
  // { id: '10', stringId: '110', driver: 'Michael Chen', deliveryDate: '13/04/24', orders: 6, outlets: 5, deliveryType: 'KEGS', volume: 480, volumeCrates: Math.round(480 / 1.3), status: 'Pending' },
  // { id: '11', stringId: '111', driver: 'Emma Wilson', deliveryDate: '15/04/24', orders: 9, outlets: 7, deliveryType: 'KEGS', volume: 750, volumeCrates: Math.round(750 / 1.3), status: 'Pending' },
  // { id: '12', stringId: '112', driver: 'James Brown', deliveryDate: '14/04/24', orders: 11, outlets: 8, deliveryType: 'KEGS', volume: 920, volumeCrates: Math.round(920 / 1.3), status: 'Pending' },
  //
  // // MECHA - Pending
  // { id: '13', stringId: '113', driver: 'Olivia Davis', deliveryDate: '13/04/24', orders: 2, outlets: 2, deliveryType: 'MECHA', volume: 150, volumeCrates: Math.round(150 / 1.3), status: 'Pending' },
  // { id: '14', stringId: '114', driver: 'David Kipyegon', deliveryDate: '16/04/24', orders: 14, outlets: 11, deliveryType: 'MECHA', volume: 1260, volumeCrates: Math.round(1260 / 1.3), status: 'Pending' },
  // { id: '15', stringId: '115', driver: 'Sunset Shop', deliveryDate: '14/04/24', orders: 8, outlets: 6, deliveryType: 'MECHA', volume: 640, volumeCrates: Math.round(640 / 1.3), status: 'Pending' },
  //
  // // CORE - Finalized
  // { id: '16', stringId: '201', driver: 'Robert Miller', deliveryDate: '12/04/24', orders: 10, outlets: 8, deliveryType: 'CORE', volume: 850, volumeCrates: Math.round(850 / 1.3), status: 'Finalized' },
  // { id: '17', stringId: '202', driver: 'Sophia Garcia', deliveryDate: '11/04/24', orders: 6, outlets: 5, deliveryType: 'CORE', volume: 520, volumeCrates: Math.round(520 / 1.3), status: 'Finalized' },
  // { id: '18', stringId: '203', driver: 'William Rodriguez', deliveryDate: '12/04/24', orders: 7, outlets: 6, deliveryType: 'CORE', volume: 610, volumeCrates: Math.round(610 / 1.3), status: 'Finalized' },
  //
  // // JARS - Finalized
  // { id: '19', stringId: '204', driver: 'Isabella Martinez', deliveryDate: '11/04/24', orders: 5, outlets: 4, deliveryType: 'JARS', volume: 420, volumeCrates: Math.round(420 / 1.3), status: 'Finalized' },
  // { id: '20', stringId: '205', driver: 'Benjamin Anderson', deliveryDate: '12/04/24', orders: 9, outlets: 7, deliveryType: 'JARS', volume: 770, volumeCrates: Math.round(770 / 1.3), status: 'Finalized' },
];

export const mockTrips: ShipmentTrip[] = [
  // Pending
  { id: '1', tripId: '10101', driver: 'Jose Hardewa', orders: 8, outlets: 6, volume: 720, volumeCrates: Math.round(720 / 1.3), capacityUsage: '85%', deliveryType: 'CORE', plannedDistance: '10.5 Km', status: 'Pending' },
  { id: '2', tripId: '10102', driver: 'Albert Leriche', orders: 12, outlets: 9, volume: 1050, volumeCrates: Math.round(1050 / 1.3), capacityUsage: '110%', deliveryType: 'CORE', plannedDistance: '23.2 Km', status: 'Pending' },
  { id: '3', tripId: '10103', driver: 'Ify Kiplimo', orders: 5, outlets: 4, volume: 380, volumeCrates: Math.round(380 / 1.3), capacityUsage: '42%', deliveryType: 'CORE', plannedDistance: '2.8 Km', status: 'Pending' },
  { id: '4', tripId: '10104', driver: 'John Mwangi', orders: 10, outlets: 7, volume: 890, volumeCrates: Math.round(890 / 1.3), capacityUsage: '95%', deliveryType: 'JARS', plannedDistance: '18.6 Km', status: 'Pending' },
  { id: '5', tripId: '10105', driver: 'Benson Othieno', orders: 4, outlets: 3, volume: 320, volumeCrates: Math.round(320 / 1.3), capacityUsage: '38%', deliveryType: 'JARS', plannedDistance: '5.4 Km', status: 'Pending' },
  { id: '6', tripId: '10106', driver: 'Michael Chen', orders: 6, outlets: 5, volume: 480, volumeCrates: Math.round(480 / 1.3), capacityUsage: '58%', deliveryType: 'KEGS', plannedDistance: '14.3 Km', status: 'Pending' },
  { id: '7', tripId: '10107', driver: 'Emma Wilson', orders: 9, outlets: 7, volume: 750, volumeCrates: Math.round(750 / 1.3), capacityUsage: '88%', deliveryType: 'KEGS', plannedDistance: '21.7 Km', status: 'Pending' },
  { id: '8', tripId: '10108', driver: 'Olivia Davis', orders: 2, outlets: 2, volume: 150, volumeCrates: Math.round(150 / 1.3), capacityUsage: '18%', deliveryType: 'MECHA', plannedDistance: '3.2 Km', status: 'Pending' },
  { id: '9', tripId: '10109', driver: 'David Kipyegon', orders: 14, outlets: 11, volume: 1260, volumeCrates: Math.round(1260 / 1.3), capacityUsage: '118%', deliveryType: 'MECHA', plannedDistance: '27.5 Km', status: 'Pending' },
  { id: '10', tripId: '10110', driver: 'Sunset Shop', orders: 8, outlets: 6, volume: 640, volumeCrates: Math.round(640 / 1.3), capacityUsage: '72%', deliveryType: 'MECHA', plannedDistance: '11.8 Km', status: 'Pending' },

  // In Transit
  { id: '11', tripId: '20101', driver: 'Sarah Johnson', orders: 13, outlets: 10, volume: 1180, volumeCrates: Math.round(1180 / 1.3), capacityUsage: '105%', deliveryType: 'JARS', plannedDistance: '19.4 Km', status: 'In Transit' },
  { id: '12', tripId: '20102', driver: 'David Karanja', orders: 15, outlets: 12, volume: 1340, volumeCrates: Math.round(1340 / 1.3), capacityUsage: '115%', deliveryType: 'CORE', plannedDistance: '31.2 Km', status: 'In Transit' },
  { id: '13', tripId: '20103', driver: 'James Brown', orders: 11, outlets: 8, volume: 920, volumeCrates: Math.round(920 / 1.3), capacityUsage: '96%', deliveryType: 'KEGS', plannedDistance: '16.9 Km', status: 'In Transit' },

  // Completed
  { id: '14', tripId: '30101', driver: 'Robert Miller', orders: 10, outlets: 8, volume: 850, volumeCrates: Math.round(850 / 1.3), capacityUsage: '92%', deliveryType: 'CORE', plannedDistance: '15.6 Km', status: 'Completed' },
  { id: '15', tripId: '30102', driver: 'William Rodriguez', orders: 7, outlets: 6, volume: 610, volumeCrates: Math.round(610 / 1.3), capacityUsage: '68%', deliveryType: 'CORE', plannedDistance: '12.3 Km', status: 'Completed' },
  { id: '16', tripId: '30103', driver: 'Isabella Martinez', orders: 5, outlets: 4, volume: 420, volumeCrates: Math.round(420 / 1.3), capacityUsage: '48%', deliveryType: 'JARS', plannedDistance: '8.7 Km', status: 'Completed' },
  { id: '17', tripId: '30104', driver: 'Benjamin Anderson', orders: 9, outlets: 7, volume: 770, volumeCrates: Math.round(770 / 1.3), capacityUsage: '86%', deliveryType: 'JARS', plannedDistance: '20.1 Km', status: 'Completed' },
];
