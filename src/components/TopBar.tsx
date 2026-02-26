import { Search, MapPin, Bell, ChevronDown } from "lucide-react";
import { useCity } from "@/contexts/CityContext";
import { cities } from "@/data/ads";
import { useState } from "react";

const TopBar = () => {
  const { city, setCity } = useCity();
  const [showCities, setShowCities] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={() => setShowCities(true)}
            className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-[18px] h-[18px] text-primary-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium leading-none mb-0.5">موقعك الحالي</p>
              <div className="flex items-center gap-1">
                <h1 className="text-base font-bold text-foreground leading-tight">{city}</h1>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </button>

          {/* App Name Center */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-lg font-black text-foreground leading-none">لمحة</span>
            <span className="text-[18px] leading-none mt-0.5">👓</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="touch-target flex items-center justify-center w-10 h-10 rounded-xl bg-secondary transition-colors active:bg-muted">
              <Bell className="w-[18px] h-[18px] text-foreground" />
            </button>
            <button className="touch-target flex items-center justify-center w-10 h-10 rounded-xl bg-secondary transition-colors active:bg-muted">
              <Search className="w-[18px] h-[18px] text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* City Picker Sheet */}
      {showCities && (
        <div className="fixed inset-0 z-[100]" onClick={() => setShowCities(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-w-[430px] mx-auto animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
            <div className="px-5 py-4">
              <h2 className="text-[16px] font-bold text-foreground mb-4">اختر مدينتك</h2>
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCity(c); setShowCities(false); }}
                    className={`touch-target w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      c === city ? "bg-primary/10 text-primary font-bold" : "text-foreground active:bg-secondary"
                    }`}
                  >
                    <MapPin className={`w-4 h-4 ${c === city ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-[14px]">{c}</span>
                    {c === city && <span className="mr-auto text-[11px] text-primary">✓ محدد</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="safe-bottom" />
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
