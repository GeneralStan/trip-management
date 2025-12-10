# Storage Migration: SessionStorage → IndexedDB

## Problem
The trips data being passed between the shipments page and generate-trips page exceeded 5MB, causing sessionStorage to crash or fail in many browsers (sessionStorage typically has a 5-10MB limit).

## Solution
Migrated from `sessionStorage` to **IndexedDB** for storing large datasets.

### Why IndexedDB?
- **Much larger storage**: 50MB+ (vs 5-10MB for sessionStorage)
- **Asynchronous**: Non-blocking operations
- **Structured storage**: Better for complex objects
- **Persistent**: Data persists across sessions until explicitly cleared

## Implementation

### New Storage Module
Created `/lib/storage.ts` with:
- `setStorageItem(key, value)` - Store data
- `getStorageItem<T>(key)` - Retrieve data with type safety
- `removeStorageItem(key)` - Delete specific item
- `STORAGE_KEYS` - Constants for storage keys

### Changes Made

#### 1. `/app/shipments/page.tsx`
**Before:**
```typescript
sessionStorage.setItem("generatedTrips", JSON.stringify(res.data ?? []))
```

**After:**
```typescript
await setStorageItem(STORAGE_KEYS.GENERATED_TRIPS, res.data ?? []);
```

#### 2. `/app/generate-trips/page.tsx`
**Before:**
```typescript
const [trips, setTrips] = useState<Trip[]>(() => {
    const savedTrips = sessionStorage.getItem('generatedTrips');
    return savedTrips ? JSON.parse(savedTrips) : [];
});
```

**After:**
```typescript
const [trips, setTrips] = useState<Trip[]>([]);
const [isLoadingTrips, setIsLoadingTrips] = useState(true);

useEffect(() => {
    getStorageItem<Trip[]>(STORAGE_KEYS.GENERATED_TRIPS)
        .then(savedTrips => {
            if (savedTrips) setTrips(savedTrips);
        })
        .finally(() => setIsLoadingTrips(false));
}, []);
```

## Usage

```typescript
import {setStorageItem, getStorageItem, STORAGE_KEYS} from '@/lib/storage';

// Store data
await setStorageItem(STORAGE_KEYS.GENERATED_TRIPS, tripsData);

// Retrieve data
const trips = await getStorageItem<Trip[]>(STORAGE_KEYS.GENERATED_TRIPS);

// Remove data
await removeStorageItem(STORAGE_KEYS.GENERATED_TRIPS);
```

## Benefits
1. ✅ Handles large datasets (>5MB) without crashing
2. ✅ Type-safe with TypeScript generics
3. ✅ Async/await API for better error handling
4. ✅ Centralized storage key management
5. ✅ SSR-safe (returns no-op implementation on server)

## Migration Notes
- All `sessionStorage` calls for large data have been replaced
- Toast data also migrated for consistency
- Loading states added to handle async data retrieval
- No changes needed to data structures or types

