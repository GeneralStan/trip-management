'use client';

import { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Trip, Order, DepotLocation } from '@/types';
import { OrderTooltip } from './OrderTooltip';
import Storefront from '@mui/icons-material/Storefront';

interface MapViewProps {
  trips: Trip[];
  depot: DepotLocation;
  center: [number, number];
  selectedOrder: { order: Order; trip: Trip } | null;
  onOrderClick: (order: Order, trip: Trip) => void;
  onMoveToRoute: () => void;
  moveToRouteActive: boolean;
  onTargetPinClick: (targetTrip: Trip) => void;
  sidebarCollapsed?: boolean;
  moveToRouteState?: {
    selectedOrder: Order | null;
    selectedTrip: Trip | null;
  };
  panToLocation?: { lat: number; lng: number; zoom?: number; timestamp?: number } | null;
}

// Pin SVG component
const createPinIcon = (color: string, isPulsing: boolean = false, isGrey: boolean = false) => {
  const fillColor = isGrey ? '#4f4f4f' : color;

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: '26px',
        height: '32px',
        pointerEvents: 'auto',
        opacity: isGrey ? 0.5 : 1,
        transform: isGrey ? 'scale(0.85)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease'
      }}
    >
      {isPulsing && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              top: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '20px',
              border: `3px solid ${color}`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '20px',
              border: `3px solid ${color}`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '20px',
              border: `3px solid ${color}`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '20px',
              border: `3px solid ${color}`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1.5s',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
      <svg
        width="26"
        height="32"
        viewBox="0 0 26 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, cursor: 'pointer' }}
      >
        <path
          d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 32 13 32C13 32 26 22.75 26 13C26 5.82 20.18 0 13 0Z"
          fill={fillColor}
        />
      </svg>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translateX(-50%) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Depot icon component
const createDepotIcon = (isDeEmphasized: boolean = false) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '35px',
        height: '44px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        opacity: isDeEmphasized ? 0.5 : 1,
        transform: isDeEmphasized ? 'scale(0.85)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease'
      }}
    >
      <svg width="35" height="44" viewBox="0 0 35 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Pin shape */}
        <path d="M17.5 0C11 0 5.5 5.5 5.5 12C5.5 21 17.5 44 17.5 44C17.5 44 29.5 21 29.5 12C29.5 5.5 24 0 17.5 0Z" fill="#DC2626"/>
      </svg>
      {/* Storefront icon */}
      <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
        <Storefront sx={{ fontSize: 14, color: 'white' }} />
      </div>
    </div>
  );
};

// Custom Zoom Controls Component
const CustomZoomControls = ({ map }: { map: google.maps.Map | null }) => {
  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        map.setZoom(currentZoom + 1);
      }
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        map.setZoom(currentZoom - 1);
      }
    }
  };

  return (
    <div
      className="absolute right-4 z-[1000] bg-white flex flex-col items-center justify-center rounded-[10px]"
      style={{
        bottom: '16px',
        border: '1px solid #E3E3E3',
        padding: '10px',
        gap: '16px',
        pointerEvents: 'auto'
      }}
    >
      <button
        type="button"
        onClick={handleZoomIn}
        className="flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
        style={{ width: '24px', height: '24px' }}
        aria-label="Zoom in"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ pointerEvents: 'none' }}>
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#252525"/>
        </svg>
      </button>

      <div style={{ width: '100%', height: '0', borderTop: '1px solid #E3E3E3', pointerEvents: 'none' }} />

      <button
        type="button"
        onClick={handleZoomOut}
        className="flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
        style={{ width: '24px', height: '24px' }}
        aria-label="Zoom out"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ pointerEvents: 'none' }}>
          <path d="M19 13H5v-2h14v2z" fill="#252525"/>
        </svg>
      </button>
    </div>
  );
};

// Helper component to access map instance
function MapController({
  mapRef,
  sidebarCollapsed,
  panToLocation
}: {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  sidebarCollapsed?: boolean;
  panToLocation?: { lat: number; lng: number; zoom?: number; timestamp?: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  // Trigger map resize when sidebar collapses
  useEffect(() => {
    if (map) {
      const timeout = setTimeout(() => {
        google.maps.event.trigger(map, 'resize');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [sidebarCollapsed, map]);

  // Pan and zoom to location when specified
  useEffect(() => {
    if (map && panToLocation) {
      const targetZoom = panToLocation.zoom ?? 18;
      map.panTo({ lat: panToLocation.lat, lng: panToLocation.lng });

      // Small delay to ensure smooth animation
      const timeout = setTimeout(() => {
        map.setZoom(targetZoom);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [panToLocation, map]);

  return null;
}

export function MapView({
  trips,
  depot,
  center,
  selectedOrder,
  onOrderClick,
  onMoveToRoute,
  moveToRouteActive,
  onTargetPinClick,
  sidebarCollapsed,
  moveToRouteState,
  panToLocation,
}: MapViewProps) {
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<{ order: Order; trip: Trip; shouldDeEmphasize: boolean } | null>(null);
  const [hoveredDepot, setHoveredDepot] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set tooltip position when selectedOrder changes (from sidebar click)
  useEffect(() => {
    if (selectedOrder && !tooltipPosition) {
      // Wait for pan animation to complete, then get marker position
      const timeout = setTimeout(() => {
        const markerId = `${selectedOrder.trip.id}-${selectedOrder.order.id}`;
        const markerElement = markerRefs.current[markerId];

        if (markerElement) {
          const bounds = markerElement.getBoundingClientRect();
          setTooltipPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top
          });
        }
      }, 400); // Wait for pan/zoom animation

      return () => clearTimeout(timeout);
    }
  }, [selectedOrder, tooltipPosition]);

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey || apiKey === 'your_api_key_here') {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-600 font-semibold mb-2">Google Maps API Key Required</div>
          <div className="text-gray-600 text-sm">
            Please add your Google Maps API key to .env.local
            <br />
            <code className="bg-gray-200 px-2 py-1 rounded mt-2 inline-block">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="trip-management-map"
          defaultCenter={{ lat: center[0], lng: center[1] }}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          <MapController mapRef={mapRef} sidebarCollapsed={sidebarCollapsed} panToLocation={panToLocation} />
          {/* Depot Marker */}
          <AdvancedMarker
            position={{ lat: depot.coordinates[0], lng: depot.coordinates[1] }}
            title="Depot location"
          >
            <div
              onMouseEnter={() => {
                setHoveredDepot(true);
              }}
              onMouseLeave={() => {
                setHoveredDepot(false);
              }}
            >
              {createDepotIcon(moveToRouteActive)}
            </div>
          </AdvancedMarker>

          {/* Order Markers */}
          {trips.map((trip) =>
            trip.orders.map((order) => {
              // Check if this is the selected order being moved
              const isSelectedForMove =
                moveToRouteActive &&
                moveToRouteState?.selectedOrder?.id === order.id &&
                moveToRouteState?.selectedTrip?.id === trip.id;

              // Check if this pin should be de-emphasized
              const shouldDeEmphasize =
                moveToRouteActive &&
                moveToRouteState?.selectedTrip?.id === trip.id &&
                moveToRouteState?.selectedOrder?.id !== order.id;

              const markerId = `${trip.id}-${order.id}`;

              return (
                <AdvancedMarker
                  key={markerId}
                  position={{ lat: order.coordinates[0], lng: order.coordinates[1] }}
                  onClick={(e: any) => {
                    if (moveToRouteActive) {
                      onTargetPinClick(trip);
                    } else {
                      // Clear hover tooltip when clicking
                      setHoveredMarker(null);

                      // Get marker element and its position
                      const markerElement = markerRefs.current[markerId];
                      if (markerElement) {
                        const bounds = markerElement.getBoundingClientRect();
                        // Position at the horizontal center, top of the pin
                        setTooltipPosition({
                          x: bounds.left + bounds.width / 2,
                          y: bounds.top
                        });
                        onOrderClick(order, trip);
                      }
                    }
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) {
                        markerRefs.current[markerId] = el;
                      } else {
                        delete markerRefs.current[markerId];
                      }
                    }}
                    onMouseEnter={() => {
                      setHoveredMarker({ order, trip, shouldDeEmphasize });
                    }}
                    onMouseLeave={() => {
                      setHoveredMarker(null);
                    }}
                  >
                    {createPinIcon(trip.color, isSelectedForMove, shouldDeEmphasize)}
                  </div>
                </AdvancedMarker>
              );
            })
          )}

          {/* Hover tooltip - shown when hovering and either no click tooltip is open OR in edit mode */}
          {hoveredMarker && (!selectedOrder || moveToRouteActive) && (
            <InfoWindow
              position={{
                lat: hoveredMarker.order.coordinates[0],
                lng: hoveredMarker.order.coordinates[1],
              }}
              onCloseClick={() => setHoveredMarker(null)}
              headerDisabled
              pixelOffset={[0, -32]}
            >
              {moveToRouteActive ? (
                <div className="text-xs font-medium text-gray-900">
                  {hoveredMarker.shouldDeEmphasize
                    ? 'Cannot move order here'
                    : `Move to Trip ${hoveredMarker.trip.tripNumber}`}
                </div>
              ) : (
                <div className="text-xs leading-relaxed">
                  <div className="font-medium text-gray-900">Order {hoveredMarker.order.id}</div>
                  <div className="text-gray-600 mt-0.5">Trip: {hoveredMarker.trip.tripNumber}</div>
                </div>
              )}
            </InfoWindow>
          )}

          {/* Depot hover tooltip */}
          {hoveredDepot && (
            <InfoWindow
              position={{
                lat: depot.coordinates[0],
                lng: depot.coordinates[1],
              }}
              onCloseClick={() => setHoveredDepot(false)}
              headerDisabled
              pixelOffset={[0, -44]}
            >
              <div className="text-xs font-medium text-gray-900">
                {moveToRouteActive ? 'Cannot move order here' : 'Depot Location'}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Order Tooltip */}
      {selectedOrder && tooltipPosition && !moveToRouteActive && (
        <OrderTooltip
          order={selectedOrder.order}
          trip={selectedOrder.trip}
          position={tooltipPosition}
          onClose={() => {
            onOrderClick(null as any, null as any);
            setTooltipPosition(null);
          }}
          onMoveToRoute={onMoveToRoute}
        />
      )}

      {/* Move to Route Instruction */}
      {moveToRouteActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="text-sm font-medium">
            Select a pin from another trip to move the order
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Esc</kbd> to cancel
          </div>
        </div>
      )}

      {/* Custom Zoom Controls */}
      <CustomZoomControls map={mapRef.current} />
    </div>
  );
}
