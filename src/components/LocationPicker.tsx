import { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from "@react-google-maps/api";
import { MapPin, Loader2, Navigation, Search } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyAR1EIyv5LLAB5x0S5WKVupz8TXSBH08oo";

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }; // Riyadh

const LIBRARIES: ("places")[] = ["places"];

const containerStyle = {
  width: "100%",
  height: "280px",
  borderRadius: "16px",
};

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

const LocationPicker = ({ lat, lng, onChange }: LocationPickerProps) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
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
        if (map) {
          map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          map.setZoom(17);
        }
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();
      onChange(newLat, newLng);
      if (map) {
        map.panTo({ lat: newLat, lng: newLng });
        map.setZoom(17);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[280px] rounded-2xl bg-secondary/30 border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Search box */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <Autocomplete
          onLoad={(ac) => { autocompleteRef.current = ac; }}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "sa" },
            fields: ["geometry", "name"],
          }}
        >
          <input
            type="text"
            placeholder="ابحث عن موقع (مثال: مطعم، شارع...)"
            className="w-full pr-10 pl-4 py-2.5 text-[13px] rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            dir="rtl"
          />
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={lat && lng ? 16 : 6}
          onClick={handleMapClick}
          onLoad={(m) => setMap(m)}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
            maxZoom: 21,
            minZoom: 4,
            gestureHandling: "greedy",
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
