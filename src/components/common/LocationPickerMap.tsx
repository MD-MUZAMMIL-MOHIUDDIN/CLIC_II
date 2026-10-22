import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Crosshair, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  zoom?: number;
  heightClass?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onChange,
  zoom = 13,
  heightClass = 'h-72 sm:h-80'
}) => {
  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Custom Pin Icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-location-picker-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            background: linear-gradient(135deg, #1B472C 0%, #245C3A 100%);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 6px 16px rgba(0,0,0,0.35);
          ">
            <div style="
              width: 14px;
              height: 14px;
              background-color: #F8C346;
              border-radius: 50%;
              transform: rotate(45deg);
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            "></div>
          </div>
          <div style="
            position: absolute;
            bottom: -8px;
            width: 12px;
            height: 5px;
            background: rgba(0,0,0,0.25);
            border-radius: 50%;
            filter: blur(1.5px);
          "></div>
        </div>
      `,
      iconSize: [38, 48],
      iconAnchor: [19, 44],
      popupAnchor: [0, -44]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: false // Custom controls
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add draggable marker
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: createPinIcon(),
        autoPan: true
      }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; text-align: center;">
          <strong style="color: #1B472C; font-size: 12px;">Marked Location</strong><br/>
          <span style="font-family: monospace; color: #555;">${lat.toFixed(6)}, ${lng.toFixed(6)}</span><br/>
          <span style="color: #888; font-size: 10px;">Drag or click map to reposition</span>
        </div>
      `);

      // Drag event
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        const newLat = Number(position.lat.toFixed(6));
        const newLng = Number(position.lng.toFixed(6));
        onChange(newLat, newLng);
      });

      // Click on map to place pin
      map.on('click', (e) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        map.panTo([newLat, newLng]);
        onChange(newLat, newLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sync external lat/lng changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - lat) > 0.00001 ||
        Math.abs(currentPos.lng - lng) > 0.00001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
        markerRef.current.setPopupContent(`
          <div style="padding: 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; text-align: center;">
            <strong style="color: #1B472C; font-size: 12px;">Marked Location</strong><br/>
            <span style="font-family: monospace; color: #555;">${lat.toFixed(6)}, ${lng.toFixed(6)}</span><br/>
            <span style="color: #888; font-size: 10px;">Drag or click map to reposition</span>
          </div>
        `);
      }
    }
  }, [lat, lng]);

  // GPS Device Geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      showToast('GPS Unsupported', 'Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const deviceLat = Number(position.coords.latitude.toFixed(6));
        const deviceLng = Number(position.coords.longitude.toFixed(6));
        onChange(deviceLat, deviceLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([deviceLat, deviceLng], 15);
        }
        showToast(
          'Location Detected',
          `GPS coordinates marked: ${deviceLat}, ${deviceLng} (Accuracy: ~${Math.round(position.coords.accuracy)}m)`,
          'success'
        );
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Could not retrieve your GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS location request timed out.';
        }
        showToast('GPS Error', errorMsg, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-stone-100 shadow-subtle group">
      {/* Map Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0 cursor-crosshair`} />

      {/* Floating Action Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
        {/* GPS Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          title="Detect Current GPS Location"
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>

        {/* Recenter */}
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-forest-900 border border-brand-border shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Recenter on Marked Pin"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-xl bg-white/95 border border-brand-border shadow-md overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 hover:bg-cream-100 text-forest-900 transition-colors flex items-center justify-center border-b border-brand-border cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 hover:bg-cream-100 text-forest-900 transition-colors flex items-center justify-center cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helper pill at bottom left */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-brand-border shadow-sm flex items-center gap-2 text-[11px] text-forest-900 font-medium pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
        <span>Click anywhere on map or drag pin to mark coordinates</span>
      </div>
    </div>
  );
};
