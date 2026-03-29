import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { MapPin, Loader2, Navigation } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyAR1EIyv5LLAB5x0S5WKVupz8TXSBH08oo";

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }; // Riyadh

const containerStyle = {
  width: "100%",
  height: "220px",
  borderRadius: "16px",
};

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

const LocationPicker = ({ lat, lng, onChange }: LocationPickerProps) => {
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const center = lat && lng ? { lat, lng } : DEFAULT_CENTER;

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onChange]
  );

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[220px] rounded-2xl bg-secondary/30 border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={lat && lng ? 15 : 6}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          {lat && lng && (
            <MarkerF
              position={{ lat, lng }}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
        className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-xl py-2.5 text-[13px] font-bold active:scale-[0.97] transition-transform disabled:opacity-50"
      >
        {loadingLocation ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        تحديد موقعي الحالي
      </button>

      {lat && lng && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary" />
          <span>تم تحديد الموقع</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
