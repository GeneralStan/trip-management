# Trip Management System

A Next.js application for managing delivery trips and routes with an interactive map interface. Dispatchers can view, manage, and reorganize orders across different trips while monitoring vehicle capacity.

## Features

### 🗺️ Interactive Map View
- **Color-coded pins**: Each trip has a unique color, making it easy to identify routes at a glance
- **Depot marker**: Red pin showing the main depot location
- **Hover interactions**: Hover over pins to see order and trip numbers
- **Click to view details**: Click pins to open detailed order information

### 📋 Trip Management Sidebar
- **Accordion trip cards**: Expandable cards showing trip statistics
- **Order tables**: Detailed view of all orders within each trip
- **Real-time updates**: Sidebar updates automatically when orders are moved
- **Search functionality**: Search for outlets across all trips

### 🔄 Order Movement
1. **Click** a colored pin on the map
2. **Click** "Move to another route" in the tooltip
3. **Click** a pin from a different trip/route
4. The order moves to the new trip and changes color accordingly
5. Press **ESC** to cancel the operation

### ⚠️ Capacity Management
- **Vehicle limit**: 860 cubes maximum capacity
- **Automatic checking**: System calculates if moving an order exceeds capacity
- **Warning modal**: Alerts dispatchers when capacity would be exceeded
- **Override option**: Allows proceeding with overage if necessary
- **"Don't show again"**: Option to suppress future warnings

### 📊 Real-time Statistics
Each trip card displays:
- Number of orders
- Total volume (cubes)
- Capacity usage percentage

## Business Rules

1. **Delivery Types**: CORE, JARS, KEGS, SPECIAL
   - All trips shown share the same delivery type
   - Orders can only be moved between trips of the same delivery type

2. **Vehicle Capacity**: 860 cubes
   - System warns when moving an order would exceed capacity
   - Dispatchers can proceed anyway if needed

3. **Route Synchronization**
   - Map pin colors update immediately when orders are moved
   - Sidebar tables reflect changes in real-time
   - Delivery sequences are automatically recalculated

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: React Leaflet + OpenStreetMap
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
trip-management/
├── app/
│   ├── globals.css         # Global styles + Leaflet CSS
│   └── page.tsx            # Main trip management page
├── components/
│   ├── CapacityWarningModal.tsx  # Overage warning dialog
│   ├── MapView.tsx               # Interactive map with pins
│   ├── OrderTooltip.tsx          # Order detail popup
│   └── TripCard.tsx              # Accordion trip card
├── lib/
│   ├── mockData.ts         # Sample trips and orders
│   └── utils.ts            # Helper functions
└── types/
    └── index.ts            # TypeScript interfaces
```

## Key Interactions

### Viewing Orders
- **Sidebar**: Click table rows or expand/collapse trip cards
- **Map**: Click colored pins to see order details

### Moving Orders Between Trips
1. Click a pin on the map
2. Click "Move to another route" button
3. Click a pin from a different colored trip
4. Confirm if capacity warning appears
5. Order color changes and tables update

### Canceling Operations
- Press **ESC** key during "move to route" mode
- Click **Cancel** in capacity warning modal
- Click **X** button in order tooltip

## Future Enhancements

- Backend API integration (structure already in place)
- Real-time collaboration between multiple dispatchers
- Route optimization algorithms
- GPS tracking integration
- Historical trip data and analytics
- Driver assignment and management
- Delivery time estimation
- Customer notification system

## Development

### Mock Data
The application currently uses mock data defined in `lib/mockData.ts`. To integrate with a real backend:

1. Update the API calls in `app/page.tsx`
2. Replace mock data imports with actual API endpoints
3. The data structure is already defined in `types/index.ts`

### Adding More Trips
Edit `lib/mockData.ts` and add new trip objects to the `mockTrips` array. Each trip must include:
- Unique ID and trip number
- Color (hex code)
- Delivery type
- Array of orders with coordinates

## License

MIT
