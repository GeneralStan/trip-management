import { Trip, DepotLocation } from '@/types';

// Mauritius coordinates for the map center
export const MAP_CENTER: [number, number] = [-20.1609, 57.5012];

// Depot location
export const DEPOT: DepotLocation = {
  name: 'Main Depot',
  coordinates: [-20.1640, 57.5050],
};

export const mockTrips: Trip[] = [
  {
    id: '1',
    tripNumber: '10101',
    subRegion: 'La Port Provide',
    color: '#7C3AED', // Purple
    deliveryType: 'CORE',
    totalOrders: 4,
    totalVolume: 720,
    capacityUsage: 84,
    orders: [
      {
        id: '0001',
        outletName: 'Amina Bakeries',
        address: 'Gladestone',
        cubes: 180,
        coordinates: [-20.1595, 57.5020],
        deliverySequence: 1,
      },
      {
        id: '0002',
        outletName: 'Amina Bakeries',
        address: 'Gladestone',
        cubes: 220,
        coordinates: [-20.1610, 57.5040],
        deliverySequence: 2,
      },
      {
        id: '0003',
        outletName: 'Yanne Boutique',
        address: 'Gladestone',
        cubes: 150,
        coordinates: [-20.1580, 57.5000],
        deliverySequence: 3,
      },
      {
        id: '0004',
        outletName: 'Sunset Shop',
        address: 'Gladestone',
        cubes: 170,
        coordinates: [-20.1620, 57.5025],
        deliverySequence: 4,
      },
    ],
  },
  {
    id: '2',
    tripNumber: '10102',
    subRegion: 'Belvedere',
    color: '#EF4444', // Red
    deliveryType: 'CORE',
    totalOrders: 5,
    totalVolume: 760,
    capacityUsage: 88,
    orders: [
      {
        id: '0005',
        outletName: 'Amina Bakeries',
        address: 'Gladestone',
        cubes: 60,
        coordinates: [-20.1625, 57.5055],
        deliverySequence: 1,
      },
      {
        id: '0006',
        outletName: 'Amina Bakeries',
        address: 'Gladestone',
        cubes: 90,
        coordinates: [-20.1635, 57.5035],
        deliverySequence: 2,
      },
      {
        id: '0007',
        outletName: 'Yanne Boutique',
        address: 'Gladestone',
        cubes: 110,
        coordinates: [-20.1605, 57.5070],
        deliverySequence: 3,
      },
      {
        id: '0008',
        outletName: 'Sunset Shop',
        address: 'Gladestone',
        cubes: 400,
        coordinates: [-20.1650, 57.5045],
        deliverySequence: 4,
      },
      {
        id: '0009',
        outletName: 'Metro Mart',
        address: 'Gladestone',
        cubes: 100,
        coordinates: [-20.1615, 57.5060],
        deliverySequence: 5,
      },
    ],
  },
  {
    id: '3',
    tripNumber: '10103',
    subRegion: "L'aventure",
    color: '#3B82F6', // Blue
    deliveryType: 'CORE',
    totalOrders: 5,
    totalVolume: 760,
    capacityUsage: 88,
    orders: [
      {
        id: '0010',
        outletName: 'Amina Bakeries',
        address: 'Gladestone',
        cubes: 60,
        coordinates: [-20.1590, 57.5045],
        deliverySequence: 1,
      },
      {
        id: '0011',
        outletName: 'Amina Bakeries',
        address: 'Gladestone',
        cubes: 90,
        coordinates: [-20.1600, 57.5030],
        deliverySequence: 2,
      },
      {
        id: '0012',
        outletName: 'Yanne Boutique',
        address: 'Gladestone',
        cubes: 110,
        coordinates: [-20.1630, 57.5015],
        deliverySequence: 3,
      },
      {
        id: '0013',
        outletName: 'Sunset Shop',
        address: 'Gladestone',
        cubes: 400,
        coordinates: [-20.1575, 57.5055],
        deliverySequence: 4,
      },
      {
        id: '0014',
        outletName: 'Metro Mart',
        address: 'Gladestone',
        cubes: 100,
        coordinates: [-20.1585, 57.5065],
        deliverySequence: 5,
      },
    ],
  },
];
