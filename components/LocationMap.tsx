'use client';

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';

type Coordinate = [number, number];
type Props = {
  center: Coordinate;
  label: string;
  route?: Coordinate[];
  step?: number;
};

export default function LocationMap({ center, label, route = [], step = 0 }: Props) {
  const marker = route.length > 0 ? route[Math.min(step, route.length - 1)] : center;

  // A stable key derived from the map centre forces React to fully unmount and
  // remount MapContainer whenever the car location changes. This is the correct
  // fix for all three Leaflet errors in this app:
  //
  // 1. appendChild TypeError – Strict Mode's double-invoke cycle calls
  //    map.remove(), which destroys Leaflet's internal DOM. MapContainer's
  //    ref guard (!mapInstanceRef.current) then blocks re-initialisation on
  //    the next mount, leaving a dead container that crashes TileLayer.
  //    A new key gives MapContainer a fresh DOM node with no stale state.
  //
  // 2. "Map container is being reused" – navigating car → car without a key
  //    reuses the same DOM node; Leaflet sees its _leaflet_id already stamped
  //    and throws. A key change forces a true unmount/remount.
  //
  // 3. _targets TypeError – cleanup fires map.remove() on a half-initialised
  //    map from the Strict Mode first-pass, hitting a null internal reference.
  //    Keying ensures each MapContainer has a complete, independent lifecycle.
  const mapKey = `${center[0]},${center[1]}`;

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {route.length > 1 && (
        <Polyline
          positions={route.slice(0, Math.max(step + 1, 1))}
          pathOptions={{ color: '#047857', weight: 5 }}
        />
      )}
      <CircleMarker
        center={marker}
        radius={10}
        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#047857', fillOpacity: 1 }}
      >
        <Popup>
          {label}
          {route.length > 0 ? ' · simulated location only' : ''}
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
