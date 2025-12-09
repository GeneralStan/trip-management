# User Flows and Component Documentation

This document provides comprehensive documentation of user flows, component behavior, business logic, and system architecture for the trip management application.

## Table of Contents

1. [Core User Flows](#core-user-flows)
2. [Component Behavior](#component-behavior)
3. [Business Logic](#business-logic)
4. [Filter System](#filter-system)
5. [Trip Generation Logic](#trip-generation-logic)
6. [Data Model](#data-model)

---

## Core User Flows

### 1. Viewing Shipments Summary

**Purpose**: Get a high-level overview of orders grouped by delivery type.

**Flow:**
```
1. User navigates to Shipments page
   ↓
2. Summary tab is active by default
   ↓
3. User sees delivery type cards (CORE, JARS, KEGS, MECHA)
   ↓
4. Each card shows:
   - Total Orders
   - Total Outlets
   - Total Cubes
   - Total Cases
   - Last Updated timestamp
   ↓
5. User can:
   - Filter by Pending/Finalized status
   - Select delivery date (defaults to current + 2 days)
   - Search delivery types
   - Download summary
   - Click "View All" to see orders for that type
```

**Components Involved:**
- `app/shipments/page.tsx` (main page)
- `components/Sidebar.tsx` (navigation)
- `components/SimpleDatePicker.tsx` (date selection)
- `components/Toast.tsx` (notifications)

**Default State:**
- Tab: Summary
- Filter: Pending
- Date: Current day + 2 days

---

### 2. Browsing and Filtering Orders

**Purpose**: View and filter orders before trip generation.

**Flow:**
```
1. User clicks "Orders" tab
   ↓
2. System displays orders table with:
   - Checkboxes for selection
   - String ID, Dispatcher, Orders count, Outlets, Volume, etc.
   ↓
3. User can filter by:
   - Status: Pending / Finalized
   - Delivery Date: Single date picker
   - More Filters:
     * Delivery Type: CORE / JARS / KEGS / MECHA
     * Dispatcher: Multi-select checkboxes
   ↓
4. User can:
   - Search orders (by String ID, Dispatcher, Delivery Type)
   - Sort by Volume/Orders/Outlets (ascending/descending)
   - Select individual orders or select all
   - View paginated results (10/20/50 per page)
   ↓
5. Selected orders show count: "X selected" with "Clear selections"
```

**Key Interactions:**
- **Date Picker**: Immediately filters on selection (no Apply button)
- **More Filters**: Shows result count, requires "Show Results" click
- **Selection**: Persists until cleared or filter changed
- **Search**: Real-time filtering as user types

**Components:**
- `app/shipments/page.tsx`
- `components/SimpleDatePicker.tsx`
- `components/MoreFiltersDropdown.tsx`
- `components/FilterCategoryList.tsx`
- `components/DeliveryTypeOptions.tsx`
- `components/DispatcherOptions.tsx`
- `components/SortByDropdown.tsx`

---

### 3. Generating Trips from Orders

**Purpose**: Create optimized delivery trips from selected orders.

**Flow:**
```
1. User selects orders in Orders tab
   ↓
2. "Generate Trips" button becomes enabled
   ↓
3. User clicks "Generate Trips"
   ↓
4. System:
   - Extracts unique String IDs from selected orders
   - Generates 3 trips per String ID
   - Trip ID format: [StringID][TripNumber]
     Example: String 101 → Trips 10101, 10102, 10103
   ↓
5. User navigated to Generate Trips page
   ↓
6. System displays:
   - Trip count in header
   - Generated trips in cards
   - All trips on map with colored pins
   - Search and filter controls
```

**Trip ID Generation Logic:**
```
For each unique String ID:
  Trip 1 ID = [StringID]01
  Trip 2 ID = [StringID]02
  Trip 3 ID = [StringID]03

Example:
  Selected orders have String IDs: 101, 102, 103

  Generated Trips:
  - String 101: 10101 (Trip 1), 10102 (Trip 2), 10103 (Trip 3)
  - String 102: 10201 (Trip 1), 10202 (Trip 2), 10203 (Trip 3)
  - String 103: 10301 (Trip 1), 10302 (Trip 2), 10303 (Trip 3)

  Total: 9 trips
```

**Components:**
- `app/shipments/page.tsx` (order selection)
- `app/generate-trips/page.tsx` (trip display)
- `lib/mockData.ts` (trip data structure)

---

### 4. Reviewing and Filtering Generated Trips

**Purpose**: Review generated trips and filter by String/Trip Number.

**Flow:**
```
1. User on Generate Trips page
   ↓
2. Sees trips listed with:
   - Trip Number (e.g., 10101)
   - Sub-region (e.g., La Porte Providence)
   - Statistics: Orders count, Volume, Capacity Usage
   - Expandable order details
   ↓
3. User can filter trips using "More Filters":
   - String: Checkboxes for String IDs (only shows selected Strings)
   - Trip Number: Trip 1, Trip 2, Trip 3 checkboxes
   ↓
4. Filter behavior:
   - Shows/hides existing trips (doesn't regenerate)
   - Both filters default to "all showing"
   - Badge shows number of active filters
   ↓
5. User can:
   - Search trips (by outlet name, order ID, trip ID)
   - Click trip to expand/collapse order list
   - Click order row to view on map
   - Collapse/expand sidebar
```

**Filter Mapping:**
```
Trip ID: 10203
         ^^^   - First 3 digits = String ID (102)
            ^^ - Last 2 digits = Trip Number (03 = Trip 3)

Filter Logic:
- String filter: Check if trip ID starts with selected String
- Trip Number filter: Check if trip ID ends with 01/02/03
  * 01 = Trip 1
  * 02 = Trip 2
  * 03 = Trip 3
```

**Components:**
- `app/generate-trips/page.tsx`
- `components/GenerateTripsFiltersDropdown.tsx`
- `components/TripCard.tsx`
- `components/MapView.tsx`

---

### 5. Moving Orders Between Trips

**Purpose**: Manually adjust trip assignments for optimization.

**Flow:**
```
1. User clicks order pin on map OR order row in trip card
   ↓
2. Order tooltip appears showing:
   - Order ID
   - Trip Number (with color indicator)
   - Delivery Type
   - Cubes
   - Outlet Name
   ↓
3. User clicks "Move to another trip" button
   ↓
4. Modal opens with:
   - Search bar for trip numbers
   - List of available trips (same delivery type only)
   - Sorted by available capacity (most space first)
   - Each trip shows: Trip Number, Orders count, Volume, Capacity %
   ↓
5. User selects target trip
   ↓
6. If capacity exceeded:
   - Warning banner appears: "Vehicle will carry X cubes over capacity"
   - Shows new capacity usage percentage
   ↓
7. User clicks "Move" button
   ↓
8. System:
   - Removes order from source trip
   - Adds order to target trip
   - Updates capacity calculations
   - Resequences delivery order
   - Shows toast: "Order X moved" with Undo option
   ↓
9. User can undo move within toast timeout
```

**Validation Rules:**
- Can only move to trips with same delivery type
- If order ID conflicts in target trip, generate new unique ID
- Capacity warnings shown but move still allowed
- Source and target trips update immediately

**Components:**
- `components/OrderTooltip.tsx` (tooltip with button)
- `components/MoveOrderModal.tsx` (selection modal)
- `components/CapacityWarningModal.tsx` (overflow warning)
- `components/Toast.tsx` (confirmation with undo)

---

### 6. Approving and Finalizing Trips

**Purpose**: Confirm trip assignments and create finalized trips.

**Flow:**
```
1. User reviews all generated trips
   ↓
2. Makes any necessary adjustments via order moves
   ↓
3. Clicks "Approve Trips" button in footer
   ↓
4. System shows loading state: "Approving..."
   ↓
5. System:
   - Saves trip assignments
   - Creates trips in database
   - Navigates back to Shipments page (Trips tab)
   ↓
6. Toast notification appears:
   - "Trips approved"
   - "X trips have been created."
   ↓
7. Trips now appear in Trips tab with Pending status
```

**Alternative Flow: Discard Changes**
```
1. User clicks back arrow or "Back to Orders"
   ↓
2. Confirmation modal appears:
   - "Discard changes?"
   - "Your generated trips will be lost"
   ↓
3. User confirms
   ↓
4. Navigate back to Orders tab
   - Trips are discarded
   - Order selections cleared
```

**Components:**
- `app/generate-trips/page.tsx`
- `components/ConfirmDiscardModal.tsx`
- `components/Toast.tsx`

---

### 7. Managing Existing Trips

**Purpose**: Monitor and manage trips after creation.

**Flow:**
```
1. User navigates to Trips tab
   ↓
2. Sees trips table filtered by status:
   - Pending: Not yet dispatched
   - In Transit: Currently being delivered
   - Completed: All deliveries done
   - Cancelled: Trip cancelled
   ↓
3. User can:
   - Filter by status tabs
   - Filter by delivery date
   - Filter by delivery type and dispatcher
   - Search trips
   - Sort by various metrics
   - Select trips for batch operations
   ↓
4. User clicks "Dispatch Trips" (when trips selected)
   ↓
5. Selected trips move to "In Transit" status
```

**Trip Metrics Displayed:**
- Trip ID
- Driver assigned
- Orders count
- Outlets count
- Volume (Cubes and Crates)
- Capacity Usage %
- Planned Distance
- Delivery Type
- Status badge
- Action menu

**Components:**
- `app/shipments/page.tsx`
- `components/TripsSortByDropdown.tsx`
- `lib/mockShipments.ts`

---

## Component Behavior

### SimpleDatePicker

**Purpose**: Single-date selection for delivery date filtering.

**Props:**
```typescript
interface SimpleDatePickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}
```

**Behavior:**
- Shows single month calendar
- Highlights selected date with dark background
- Month/year navigation with arrows
- Immediate selection (no Apply button needed)
- Closes automatically on date selection
- Displays friendly date labels: "Today", "Yesterday", "Tomorrow"

**Default Value:**
```typescript
// Defaults to current day + 2 days
const getDefaultDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  date.setHours(0, 0, 0, 0);
  return date;
};
```

**Visual States:**
- **Selected**: Dark background (#252525), white text
- **Hover**: Light gray background (#F5F5F5)
- **Default**: White background, dark text

---

### TripCard

**Purpose**: Displays trip summary with expandable order list.

**Props:**
```typescript
interface TripCardProps {
  trip: Trip;
  onOrderClick?: (order: Order, trip: Trip, shouldPan?: boolean) => void;
}
```

**Features:**
1. **Accordion Header** (Always Visible):
   - Color indicator square
   - Trip number
   - Sub-region (truncates with ellipsis)
   - Statistics (Orders, Volume, Capacity %)
   - Expand/collapse toggle
   - Selection checkmark (when isSelected=true)

2. **Order Table** (Expandable):
   - Columns: Order ID, Outlet Name, Address, Cubes
   - Row hover effect
   - Click to view on map (triggers pan)
   - Sorted by delivery sequence

**States:**
- **Expanded**: Shows full order table
- **Collapsed**: Shows only header
- **Selected**: Green checkmark in top-right corner
- **Hover**: Shadow effect on card

**Styling:**
- Background: #F9FAFB
- Border: #E3E3E3 (1px)
- Border radius: 8px
- Hover shadow: 0 4px 6px -1px rgba(0,0,0,0.1)

---

### MoreFiltersDropdown (Shipments)

**Purpose**: Advanced filtering for Orders and Trips tabs.

**Props:**
```typescript
interface MoreFiltersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    deliveryType: string;
    dispatchers: string[];
  };
  onApplyFilters: (filters) => void;
  availableDispatchers: string[];
  orderFilterTab: OrderFilterTab;
  tripFilterTab?: TripFilterTab;
  currentTab: 'orders' | 'trips';
}
```

**Layout:**
```
┌───────────────┬──────────────────────┐
│ Delivery Type │  ○ CORE              │
│ [CORE]        │  ○ JARS              │
│               │  ○ KEGS              │
│ Dispatcher    │  ○ MECHA             │
│ [2]  Clear    │                       │
└───────────────┴──────────────────────┘
   [Reset]           [Show Results]
```

**Features:**
1. **Left Panel**: Filter categories with badges
   - Shows active filter count
   - "Clear" button when filters selected
   - Highlights active category

2. **Right Panel**: Filter options
   - Delivery Type: Radio buttons
   - Dispatcher: Checkboxes with search

3. **Footer**:
   - Result count preview
   - Reset button (clears all)
   - Show Results button (applies filters)

**Dimensions:**
- Width: 480px
- Height: 380px (fixed)
- Border: 1px solid #E3E3E3
- Border radius: 8px
- Shadow: shadow-xl

---

### GenerateTripsFiltersDropdown

**Purpose**: Filtering for generated trips by String and Trip Number.

**Props:**
```typescript
interface GenerateTripsFiltersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    stringIds: string[];
    tripNumbers: string[];
  };
  onApplyFilters: (filters) => void;
  availableStringIds: string[];
}
```

**Filter Categories:**
1. **String**: Checkbox list of String IDs
   - Only shows String IDs from generated trips
   - Sorted numerically
   - Multi-select allowed

2. **Trip Number**: Checkbox list
   - Options: "Trip 1", "Trip 2", "Trip 3"
   - Multi-select allowed
   - Maps to trip ID suffixes (01, 02, 03)

**Behavior:**
- Both filters start with all options showing (empty selection)
- Filters apply AND logic (trip must match all selected filters)
- Badge shows total count of selected filters
- Reset button clears all selections
- Show Results button applies and closes

**Same Dimensions as MoreFiltersDropdown**: 480px × 380px

---

### MapView

**Purpose**: Interactive map displaying trip routes and order locations.

**Props:**
```typescript
interface MapViewProps {
  trips: Trip[];
  depot: DepotLocation;
  center: [number, number];
  selectedOrder: { order: Order; trip: Trip } | null;
  onOrderClick: (order: Order, trip: Trip, shouldPan?: boolean) => void;
  onMoveToRoute: () => void;
  sidebarCollapsed?: boolean;
  panToLocation?: { lat: number; lng: number; zoom?: number; timestamp?: number } | null;
}
```

**Features:**
1. **Markers**:
   - Order pins: Color-coded by trip, clickable
   - Depot pin: Red with storefront icon
   - Hover tooltip: Shows order ID and trip number
   - Click tooltip: OrderTooltip with actions

2. **Map Controls**:
   - Custom zoom controls (bottom-right)
   - Gesture handling: "greedy" (no Ctrl+scroll required)
   - Disabled default UI (using custom controls)

3. **Interactions**:
   - Click order pin: Show tooltip, no pan
   - Click order from sidebar: Pan to location + show tooltip
   - Hover order pin: Show mini info window
   - Click outside tooltip: Close tooltip

4. **Map Initialization**:
   - Center: Mauritius coordinates [-20.1609, 57.5012]
   - Default zoom: 15
   - Pan zoom (from sidebar): 17-18
   - Map ID: "trip-management-map"

**Pin Colors**:
- Match trip color from Trip.color property
- Examples: #7C3AED (purple), #EF4444 (red), #3B82F6 (blue)

---

### MoveOrderModal

**Purpose**: Select target trip for moving an order.

**Features:**
1. **Header**: "Move to another trip" with close button
2. **Capacity Warning** (if applicable):
   - Orange banner with warning icon
   - Shows overage amount
   - Shows new capacity percentage

3. **Description**: Explains which order is being moved

4. **Search Bar**: Filter trips by trip number

5. **Trip List** (scrollable):
   - Sorted by available capacity (most space first)
   - Shows: Color indicator, Trip Number, Stats
   - Hover effect
   - Selected trip: Dark border + checkmark
   - Height: 217px fixed, scrollable

6. **Footer**:
   - Cancel button
   - Move button (disabled until trip selected)

**Validation:**
- Only shows trips with same delivery type
- Capacity warnings shown inline
- Move still allowed even with capacity warning

**Keyboard Support:**
- ESC to close
- Click outside to close
- Focus trap within modal

---

## Business Logic

### Capacity Calculation

**Vehicle Capacity**: 860 cubes (constant)

**Formula:**
```typescript
capacityUsage = Math.round((totalVolume / 860) * 100)
```

**Color Coding:**
- < 80%: Green
- 80-100%: Yellow/Warning
- > 100%: Red/Error

**Example:**
```
Trip has 720 cubes of orders
Capacity Usage = (720 / 860) × 100 = 83.72% → rounds to 84%
```

---

### Delivery Sequence

**Rules:**
1. Orders numbered sequentially starting from 1
2. When order removed: Remaining orders renumbered
3. When order added: Appended to end with next sequence number
4. Delivery sequence shown in order list but not enforced on map

**Example:**
```
Initial Trip:
  Order A (seq: 1)
  Order B (seq: 2)
  Order C (seq: 3)

Remove Order B:
  Order A (seq: 1)
  Order C (seq: 2)  ← Renumbered

Add Order D:
  Order A (seq: 1)
  Order C (seq: 2)
  Order D (seq: 3)  ← New sequence
```

---

### Trip ID Validation

**Format**: XXXNN
- XXX = 3-digit String ID
- NN = 2-digit Trip Number (01-03)

**Validation Rules:**
- Must be exactly 5 digits
- First 3 digits: String ID
- Last 2 digits: 01, 02, or 03

**Examples:**
- ✅ Valid: 10101, 20503, 15602
- ❌ Invalid: 1010 (too short), 101001 (too long), 10105 (invalid trip number)

---

### Order ID Conflict Resolution

When moving an order to a trip that already has that order ID:

**Algorithm:**
```typescript
const allOrderIds = targetTrip.orders.map(o => parseInt(o.id, 10));
const maxId = Math.max(...allOrderIds);
const newOrderId = String(maxId + 1).padStart(4, '0');
```

**Example:**
```
Target trip has orders: 0001, 0002, 0005
Moving order 0002 (conflicts)
New ID = max(1, 2, 5) + 1 = 6 → "0006"
```

---

## Filter System

### Filter Behavior Summary

| Filter | Type | Apply Timing | Persistence |
|--------|------|--------------|-------------|
| Status Tabs | Single-select | Immediate | Tab switch clears selections |
| Delivery Date | Single date | Immediate | Persists across tabs |
| Search | Text input | Immediate (real-time) | Persists across tabs |
| Delivery Type | Single-select | On "Show Results" | Persists |
| Dispatcher | Multi-select | On "Show Results" | Persists |
| Sort By | Dropdown | Immediate | Persists per tab |

### Filter Combination Logic

**Orders Tab Filters:**
```
Final Results = Orders
  .filter(status === selected tab)
  .filter(deliveryType === selected type)
  .filter(dispatcher in selected dispatchers OR no dispatchers selected)
  .filter(search matches StringID OR Driver OR DeliveryType)
  .sort(by selected option and order)
  .paginate(page, itemsPerPage)
```

**Generate Trips Filters:**
```
Final Results = Trips
  .filter(stringId in selected strings OR no strings selected)
  .filter(tripNumber in selected numbers OR no numbers selected)
  .map(trip => {
    if (search) {
      return trip with filtered orders
    }
    return trip
  })
  .filter(has orders after search)
```

---

## Trip Generation Logic

### Input: Selected Orders

**User selects orders in Orders tab:**
```typescript
selectedOrders: Set<string> = new Set([
  "order-001",  // String ID: 101
  "order-002",  // String ID: 101
  "order-003",  // String ID: 102
  "order-004",  // String ID: 103
  "order-005",  // String ID: 103
])
```

### Step 1: Extract Unique String IDs

```typescript
const uniqueStringIds = new Set<string>();
selectedOrders.forEach(orderId => {
  const order = findOrderById(orderId);
  uniqueStringIds.add(order.stringId);
});

// Result: Set(['101', '102', '103'])
```

### Step 2: Generate Trips

**For each String ID, create 3 trips:**

```typescript
const trips: Trip[] = [];

uniqueStringIds.forEach(stringId => {
  for (let tripNum = 1; tripNum <= 3; tripNum++) {
    const tripId = `${stringId}${tripNum.toString().padStart(2, '0')}`;

    trips.push({
      id: generateUniqueId(),
      tripNumber: tripId,
      subRegion: getSubRegionForString(stringId),
      color: assignTripColor(),
      deliveryType: getDeliveryType(stringId),
      orders: distributeOrders(stringId, tripNum),
      // ... other fields calculated
    });
  }
});
```

**Example Output:**
```
String IDs: [101, 102, 103]

Generated Trips:
├─ Trip 10101 (String 101, Trip 1)
├─ Trip 10102 (String 101, Trip 2)
├─ Trip 10103 (String 101, Trip 3)
├─ Trip 10201 (String 102, Trip 1)
├─ Trip 10202 (String 102, Trip 2)
├─ Trip 10203 (String 102, Trip 3)
├─ Trip 10301 (String 103, Trip 1)
├─ Trip 10302 (String 103, Trip 2)
└─ Trip 10303 (String 103, Trip 3)

Total: 9 trips
```

### Step 3: Order Distribution

**Algorithm for distributing orders across 3 trips:**

```typescript
function distributeOrders(stringId: string, tripNumber: number): Order[] {
  const ordersForString = selectedOrders
    .filter(order => order.stringId === stringId);

  // Simple round-robin distribution
  const ordersPerTrip = Math.ceil(ordersForString.length / 3);
  const startIndex = (tripNumber - 1) * ordersPerTrip;
  const endIndex = startIndex + ordersPerTrip;

  return ordersForString.slice(startIndex, endIndex);
}
```

**Example:**
```
String 101 has 6 orders: [A, B, C, D, E, F]

Distribution:
- Trip 10101: [A, B]
- Trip 10102: [C, D]
- Trip 10103: [E, F]
```

### Step 4: Calculate Trip Metrics

```typescript
function calculateTripMetrics(orders: Order[]): TripMetrics {
  const totalOrders = orders.length;
  const totalVolume = orders.reduce((sum, o) => sum + o.cubes, 0);
  const capacityUsage = Math.round((totalVolume / 860) * 100);

  return {
    totalOrders,
    totalVolume,
    capacityUsage,
  };
}
```

### Step 5: Assign Colors

**Color Assignment:**
```typescript
const tripColors = [
  '#7C3AED',  // Purple
  '#EF4444',  // Red
  '#3B82F6',  // Blue
  '#10B981',  // Green
  '#F97316',  // Orange
];

let colorIndex = 0;

function assignTripColor(): string {
  const color = tripColors[colorIndex % tripColors.length];
  colorIndex++;
  return color;
}
```

**Result:**
- Trips cycle through colors
- Each trip gets unique color for map visualization
- Colors repeat after 5 trips

---

## Data Model

### Trip Type

```typescript
interface Trip {
  id: string;                    // Unique identifier
  tripNumber: string;            // 5-digit trip ID (XXXNN)
  subRegion: string;             // Geographic region
  color: string;                 // Hex color for map pin
  deliveryType: 'CORE' | 'JARS' | 'KEGS' | 'MECHA';
  totalOrders: number;           // Count of orders
  totalVolume: number;           // Sum of cubes
  capacityUsage: number;         // Percentage (0-100+)
  orders: Order[];               // Array of orders in trip
  isSelected?: boolean;          // UI state for selection
}
```

### Order Type

```typescript
interface Order {
  id: string;                    // 4-digit order ID
  outletName: string;            // Customer name
  address: string;               // Delivery address
  cubes: number;                 // Volume in cubes
  coordinates: [number, number]; // [lat, lng]
  deliverySequence: number;      // Order in delivery route (1-based)
}
```

### ShipmentOrder Type (Orders Tab)

```typescript
interface ShipmentOrder {
  id: string;                    // Unique ID
  stringId: string;              // String identifier
  driver: string;                // Dispatcher/driver name
  orders: number;                // Count of orders
  outlets: number;               // Count of unique outlets
  volume: number;                // Cubes
  volumeCrates: number;          // Crates
  deliveryType: 'CORE' | 'JARS' | 'KEGS' | 'MECHA';
  status: 'Pending' | 'Finalized';
}
```

### ShipmentTrip Type (Trips Tab)

```typescript
interface ShipmentTrip {
  id: string;                    // Unique ID
  tripId: string;                // 5-digit trip number
  driver: string;                // Assigned driver
  orders: number;                // Count of orders
  outlets: number;               // Count of unique outlets
  volume: number;                // Cubes
  volumeCrates: number;          // Crates
  capacityUsage: string;         // Percentage as string (e.g., "84%")
  plannedDistance: string;       // Distance with unit (e.g., "25.5 Km")
  deliveryType: 'CORE' | 'JARS' | 'KEGS' | 'MECHA';
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
}
```

---

## Performance Considerations

### Pagination
- **Items per page**: 10 (default), 20, 50 (selectable)
- **Implementation**: Array slicing on filtered results
- **Reset**: Page resets to 1 when filters or tab changes

### Search Debouncing
- **Orders/Trips Search**: No debounce (immediate)
- **More Filters Result Count**: 300ms debounce
- **Dispatcher Search**: No debounce (small dataset)

### Map Rendering
- **Initial Load**: All trip markers rendered
- **Filter Change**: Markers hidden/shown (not re-rendered)
- **Pan Optimization**: Only pans when needed (sidebar clicks)
- **Tooltip Positioning**: Calculated after pan animation completes (600ms delay)

### State Management
- **Component-level state**: For UI interactions
- **No global state**: Each page manages its own state
- **URL params**: For tab and deliveryType (enables deep linking)
- **Session storage**: For cross-page toasts

---

## Error Handling

### API Key Missing/Invalid
```
Map displays error message:
"Google Maps API Key Missing" or "Invalid Google Maps API Key"
```

### Empty States

**No Orders:**
```
"No orders found for selected filters"
```

**No Trips:**
```
"No trips found. Select orders and click Generate Trips."
```

**No Search Results:**
```
"No results found. We couldn't find any outlets matching '[query]'."
```

### Validation Errors

**Capacity Overflow:**
- Warning banner shown in MoveOrderModal
- Move still allowed (not blocked)
- Toast shows after successful move

**Order ID Conflict:**
- Automatically resolved with new ID
- No user intervention needed
- Logged to console for debugging

---

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- ESC to close modals and dropdowns
- Enter to select/confirm
- Arrow keys in date picker

### ARIA Labels
- Buttons have aria-label attributes
- Modals have role="dialog" and aria-modal="true"
- Headers have proper heading levels (h1, h2, h3)

### Screen Reader Support
- Status messages announced
- Form inputs properly labeled
- Table headers associated with data cells

---

## Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Support:**
- iOS Safari 14+
- Chrome Android 90+

**Required Features:**
- ES2020 features (optional chaining, nullish coalescing)
- CSS Grid and Flexbox
- Intersection Observer (for lazy loading)
- Google Maps JavaScript API

---

## Future Enhancements

**Planned Features:**
1. Real-time trip tracking
2. Driver mobile app integration
3. Route optimization algorithms
4. Predictive capacity warnings
5. Historical trip analytics
6. Automated trip generation based on rules
7. Multi-depot support
8. Weather-based route adjustments

**Under Consideration:**
1. Export trips to PDF/CSV
2. Bulk trip editing
3. Trip templates
4. Customer delivery windows
5. Vehicle type selection

---

## Related Documentation

- [Deprecated Features](./DEPRECATED_FEATURES.md)
- [API Documentation](./API.md) (if backend exists)
- [Component Storybook](./STORYBOOK.md) (if Storybook configured)
- [Testing Guide](./TESTING.md) (if tests exist)

---

**Last Updated**: December 9, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
