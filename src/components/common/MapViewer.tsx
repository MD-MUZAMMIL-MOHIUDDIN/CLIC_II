import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'chc' | 'fmc' | 'store';
  address?: string;
  phone?: string;
  verified?: boolean;
}

interface MapViewerProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  markers,
  center = [22.7196, 75.8577], // Default to Central India (Indore area)
  zoom = 9,
  onMarkerClick,
  className = 'h-96'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom SVG Marker Icon
    const createCustomIcon = (type: string) => {
      const color = type === 'chc' ? '#245C3A' : type === 'fmc' ? '#3A6B3D' : '#9B6A43';
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    };

    // Add markers
    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;
      const marker = L.marker([m.lat, m.lng], { icon: createCustomIcon(m.type) }).addTo(map);

      const popupContent = `
        <div style="padding: 6px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #202B24;">${m.name}</h4>
          ${m.address ? `<p style="margin: 4px 0 2px; font-size: 12px; color: #66736A;">${m.address}</p>` : ''}
          ${m.phone ? `<p style="margin: 2px 0 6px; font-size: 12px; color: #245C3A; font-weight: 600;">Tel: ${m.phone}</p>` : ''}
          <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; background: #DDE9E0; color: #1B472C;">
            ${m.type.toUpperCase()} ${m.verified ? '• Verified' : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(m.id);
      });
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Don't necessarily destroy on every small rerender, but keep safe
    };
  }, [markers, center, zoom, onMarkerClick]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-brand-border shadow-card ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-brand-border text-[11px] font-semibold text-brand-text shadow-subtle flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-600 inline-block"></span> CHC Centres
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-agri-dark inline-block"></span> FMC Centres
        </span>
      </div>
    </div>
  );
};
