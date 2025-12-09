# Deprecated Features

This document outlines features and components that have been removed or deprecated from the trip management application, along with their original functionality and reasons for deprecation.

## Table of Contents

1. [Date Range Picker Component](#date-range-picker-component)
2. [In-Map Trip Modification Feature](#in-map-trip-modification-feature)

---

## Date Range Picker Component

### Overview
A comprehensive date range picker that allowed users to select date ranges with preset options and dual calendar views.

### Component Location
- **File**: `components/DatePicker.tsx`
- **Status**: Deprecated (replaced by SimpleDatePicker.tsx)

### Functionality

#### Features
1. **Dual Calendar View**
   - Displayed two months side by side for easier range selection
   - Month/year navigation controls on both calendars
   - Quick year navigation with double-arrow buttons

2. **Preset Date Ranges**
   - Today: Current date
   - Yesterday: Previous day
   - Last 7 days: Date range from 6 days ago to today
   - Last 30 days: Date range from 29 days ago to today
   - Custom: Manual date range selection

3. **Visual Indicators**
   - Selected dates highlighted with dark background
   - Date range shown with light gray background
   - Range start/end dates with rounded corners
   - Active preset shown with checkmark

4. **Input Fields**
   - Start date and end date input fields (read-only)
   - Format: dd/mm/yyyy
   - Only visible when "Custom" preset selected

5. **Footer Controls**
   - Days selected counter (e.g., "7 days selected")
   - Clear button: Reset all selections
   - Apply button: Confirm and apply selected range

#### User Interface

```
┌────────────────────────────────────────────────────────┐
│  Presets     │     Calendar 1        Calendar 2        │
│  ┌────────┐  │  ┌─────────────┐  ┌─────────────┐      │
│  │ Today  │  │  │   Jan 2025  │  │   Feb 2025  │      │
│  │ Yester │  │  │ M T W T F S S│  │ M T W T F S S│      │
│  │ Last 7 │  │  │ 1 2 3 4 5 6 7│  │       1 2 3 4│      │
│  │ Last30 │  │  │ ... (dates)  │  │   ... (dates)│      │
│  │ Custom │  │  └─────────────┘  └─────────────┘      │
│  └────────┘  │                                          │
├──────────────┴──────────────────────────────────────────│
│  7 days selected          [Clear]  [Apply]              │
└──────────────────────────────────────────────────────────┘
```

#### Technical Implementation

**Key Components:**
- State management for start/end dates, active preset
- Dual calendar generation with proper month/year handling
- Date range calculation and validation
- Visual range highlighting with extended backgrounds
- Keyboard support (ESC to close)

**Date Handling:**
- Monday-Sunday week layout
- Date comparison utilities (isSameDay, isDateInRange, isDateBetween)
- Automatic date swapping if end date selected before start date
- Preset detection when manual selection matches preset range

### Reason for Deprecation

1. **Over-complexity**: The dual-calendar, preset-based interface was too complex for the app's use case
2. **Workflow Mismatch**: Users typically work on orders 2 days ahead, making single-date selection more appropriate
3. **Apply Button Friction**: Extra step to apply dates slowed down user workflow
4. **Default Limitation**: Couldn't easily set "current day + 2" as default with range picker

### Replacement

**Component**: `SimpleDatePicker.tsx`

**Key Improvements:**
- Single date selection (not ranges)
- Default to current day + 2 days
- Immediate filtering on date selection (no Apply button)
- Simpler, cleaner interface
- Displays "Tomorrow" for day after today
- Single calendar view
- Automatic application of selected date

**Usage Example:**
```tsx
<SimpleDatePicker
  selectedDate={deliveryDate}
  onSelectDate={(date) => {
    setDeliveryDate(date);
    setShowDatePicker(false);
  }}
/>
```

---

## In-Map Trip Modification Feature

### Overview
An interactive feature that allowed users to modify trip routes and orders directly on the map view through drag-and-drop interactions and map-based order management.

### Feature Location
- **Branch**: `feature/in-map-trip-modification`
- **Status**: Deprecated (not merged to main)
- **Related Components**: MapView.tsx (modified version), OrderTooltip.tsx (enhanced version)

### Functionality

#### Core Features

1. **Drag-and-Drop Order Movement**
   - Click and drag order pins on the map
   - Visual feedback during drag operation
   - Drop onto different trip routes to move orders
   - Real-time route recalculation

2. **Map-Based Order Selection**
   - Click order pins to view details in tooltip
   - Multi-select orders with Ctrl/Cmd + click
   - Lasso selection tool for selecting multiple nearby orders
   - Visual highlighting of selected orders

3. **Interactive Route Editing**
   - Reorder delivery sequence by dragging pins
   - Add waypoints to trips
   - Visualize route changes in real-time
   - Capacity warnings when moving orders

4. **Trip Visualization Enhancements**
   - Color-coded route lines on map
   - Animated transitions when orders move
   - Route distance calculations displayed
   - Capacity usage bars on map

#### User Workflow

```
1. User views trip routes on map
   ↓
2. Clicks order pin to select it
   ↓
3. Drags pin to another trip's route
   ↓
4. System shows:
   - Ghost pin during drag
   - Target trip highlight
   - Capacity warning if needed
   ↓
5. User drops pin on target trip
   ↓
6. System updates:
   - Trip assignments
   - Route recalculation
   - Capacity usage
   - Toast notification with undo option
```

#### Technical Implementation

**Map Interactions:**
- Google Maps Drawing Manager for lasso tool
- Custom marker dragging with AdvancedMarker API
- Route polylines with DirectionsRenderer
- Real-time distance matrix calculations

**State Management:**
- Drag state (isDragging, draggedOrder, ghostMarkerPosition)
- Selected orders set
- Hover state for trip routes
- Undo/redo stack for order movements

**Validation Logic:**
- Capacity overflow warnings
- Delivery time window conflicts
- Route distance constraints
- Depot return time validation

**Visual Feedback:**
- Pulsing animations on selected pins
- Semi-transparent ghost marker during drag
- Route line thickness changes on hover
- Color transitions for capacity warnings

#### Components Modified

1. **MapView.tsx**
   - Added drag-and-drop handlers
   - Implemented lasso selection tool
   - Route visualization with polylines
   - Marker clustering for dense areas

2. **OrderTooltip.tsx**
   - Enhanced with quick action buttons
   - Showed affected trip details
   - Capacity impact calculator
   - Mini route preview

3. **TripCard.tsx**
   - Drop zone indicators
   - Real-time capacity updates
   - Visual feedback for valid/invalid drops

### Reason for Deprecation

1. **Complexity vs. Value**: The implementation complexity outweighed the actual user benefit
2. **User Feedback**: Users preferred the modal-based approach for precision and clarity
3. **Mobile Limitations**: Drag-and-drop didn't work well on touch devices
4. **Accidental Modifications**: Too easy to accidentally move orders with unintended clicks/drags
5. **Performance Issues**: Real-time route recalculation was resource-intensive
6. **Validation Challenges**: Difficult to show all constraint violations during drag operation
7. **Learning Curve**: Required training for users to understand the interaction model

### Replacement

**Feature**: Modal-Based Trip Modification

**Implementation:**
- `MoveOrderModal.tsx` component
- Click order → Opens modal
- Search and select target trip
- Explicit "Move" button confirmation
- Capacity warnings before move
- Clearer validation messaging

**Advantages:**
- More deliberate user actions
- Better validation feedback
- Works on all devices
- Clearer capacity information
- Undo functionality
- Lower performance overhead

**User Workflow:**
```
1. Click order pin on map
   ↓
2. Click "Move to another trip" button in tooltip
   ↓
3. Modal opens with:
   - List of available trips
   - Capacity information
   - Search functionality
   ↓
4. User selects target trip
   ↓
5. Capacity warning shown if needed
   ↓
6. User clicks "Move" button
   ↓
7. Order moved with toast notification and undo option
```

### Code References

**Branch**: `feature/in-map-trip-modification`

**Key Files (in deprecated branch):**
- `components/MapView.tsx` (lines 200-450: drag handlers)
- `components/OrderTooltip.tsx` (lines 100-200: quick actions)
- `components/LassoSelectionTool.tsx` (entire file)
- `lib/routeCalculations.ts` (route optimization logic)
- `lib/dragAndDropHandlers.ts` (drag interaction logic)

### Lessons Learned

1. **User Testing is Critical**: The feature seemed intuitive to developers but confusing to actual users
2. **Mobile-First Matters**: Features should work equally well on touch and mouse inputs
3. **Validation UX**: Complex validation rules need clear, upfront communication
4. **Performance Budget**: Real-time features need careful performance consideration
5. **Simplicity Wins**: Sometimes a simple modal is better than a fancy interaction

---

## Future Deprecations

Features under consideration for deprecation:

### 1. Advanced Sorting Options
**Reason**: Users rarely change from default sort
**Potential Replacement**: Fixed default sort with optional simple A-Z toggle

### 2. Multiple Delivery Types
**Reason**: 90% of orders are "CORE" type
**Potential Replacement**: Simplify to single delivery type with optional tags

---

## Accessing Deprecated Features

### Viewing Deprecated Code

**Date Range Picker:**
```bash
# Component still exists in codebase for reference
cat components/DatePicker.tsx
```

**In-Map Trip Modification:**
```bash
# Check out the feature branch
git checkout feature/in-map-trip-modification

# View the implementation
git log --oneline --graph
```

### Restoration Process

If you need to restore a deprecated feature:

1. **For Date Range Picker:**
   ```tsx
   // Import the old component
   import DatePicker from '@/components/DatePicker';

   // Replace SimpleDatePicker with DatePicker
   <DatePicker
     startDate={deliveryDateStart}
     endDate={deliveryDateEnd}
     onSelectDateRange={(start, end) => {
       setDeliveryDateStart(start);
       setDeliveryDateEnd(end);
     }}
     onClose={() => setShowDatePicker(false)}
   />
   ```

2. **For In-Map Modification:**
   ```bash
   # Create a new branch from the feature branch
   git checkout -b restore-in-map-modification feature/in-map-trip-modification

   # Merge with current main (resolve conflicts)
   git merge main
   ```

---

## Contact

For questions about deprecated features or their replacements, please refer to:
- **Documentation**: `docs/USER_FLOWS.md`
- **Issue Tracker**: GitHub Issues
- **Code Comments**: Inline documentation in replacement components
