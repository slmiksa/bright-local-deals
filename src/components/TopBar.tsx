import { Search, MapPin, ChevronDown } from "lucide-react";
import { useCity } from "@/contexts/CityContext";
import { useCities } from "@/hooks/useAds";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { city, setCity } = useCity();
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const [showCities, setShowCities] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-primary" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="px-3 py-2.5">
          <div className="relative flex items-center bg-card rounded-2xl shadow-sm px-3 py-2">
            {/* City selector - right side */}
            <button
              onClick={() => setShowCities(true)}
              className="flex items-center gap-1.5 active:opacity-70 transition-opacity shrink-0">
              <MapPin className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
              <span className="text-[14px] font-bold text-foreground leading-tight">{city}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Logo text - absolutely centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[17px] font-black text-foreground bg-primary/10 px-4 py-1 rounded-full leading-none">لمحة</span>
            </div>

            <div className="flex-1" />

            {/* Search - left side */}
            <button
              onClick={() => navigate("/search")}
              className="shrink-0 active:opacity-70 transition-opacity bg-muted/60 p-1.5 rounded-full"
            >
              <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

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
                {citiesLoading ? (
                  <div className="text-center py-8">
                    <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : cities.length === 0 ? (
                  <p className="text-center text-muted-foreground text-[14px] py-8">لا توجد مدن مسجلة</p>
                ) : (
                  cities.map((c) => (
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
                  ))
                )}
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
