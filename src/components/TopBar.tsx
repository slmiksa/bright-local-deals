import { Search, MapPin, ChevronDown, ChevronLeft } from "lucide-react";
import { useCity } from "@/contexts/CityContext";
import { useRegionsWithCities } from "@/hooks/useRegions";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { city, selectionMode, regionName, selectCity, selectRegion } = useCity();
  const { data: regions = [], isLoading } = useRegionsWithCities();
  const [showCities, setShowCities] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const navigate = useNavigate();

  const displayName = selectionMode === "region" ? regionName : city;

  const handleSelectCity = (cityName: string) => {
    selectCity(cityName);
    setShowCities(false);
  };

  const handleSelectRegion = (rId: string, rName: string) => {
    selectRegion(rId, rName);
    setShowCities(false);
  };

  const toggleRegion = (rId: string) => {
    setExpandedRegion(expandedRegion === rId ? null : rId);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-primary" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="px-3 py-2.5">
          <div className="relative flex items-center bg-card rounded-2xl shadow-sm px-3 py-2">
            {/* City selector - right side */}
            <button
              onClick={() => setShowCities(true)}
              className="flex items-center gap-1.5 active:opacity-70 transition-opacity shrink-0">
              <MapPin className="w-[18px] h-[18px] text-primary animate-pulse" strokeWidth={2} />
              <span className="text-[14px] font-bold text-foreground leading-tight truncate max-w-[100px]">{displayName}</span>
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
              <h2 className="text-[16px] font-bold text-foreground mb-4">اختر موقعك</h2>
              <div className="space-y-1 max-h-[55vh] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : regions.length === 0 ? (
                  <p className="text-center text-muted-foreground text-[14px] py-8">لا توجد مناطق مسجلة</p>
                ) : (
                  regions.map((region) => {
                    const isExpanded = expandedRegion === region.id;
                    const isRegionSelected = selectionMode === "region" && region.name === regionName;

                    return (
                      <div key={region.id}>
                        {/* Region header */}
                        <button
                          onClick={() => toggleRegion(region.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isRegionSelected ? "bg-primary/10" : "active:bg-secondary"
                          }`}
                        >
                          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "-rotate-90" : ""}`} />
                          <MapPin className={`w-4 h-4 ${isRegionSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-[14px] font-bold flex-1 text-right ${isRegionSelected ? "text-primary" : "text-foreground"}`}>
                            {region.name}
                          </span>
                          {isRegionSelected && <span className="text-[11px] text-primary">✓</span>}
                        </button>

                        {/* Cities under region */}
                        {isExpanded && (
                          <div className="mr-6 space-y-0.5 mt-0.5 mb-1">
                            {/* Select all cities in region */}
                            <button
                              onClick={() => handleSelectRegion(region.id, region.name)}
                              className={`touch-target w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                                isRegionSelected ? "bg-primary/10 text-primary font-bold" : "text-foreground active:bg-secondary"
                              }`}
                            >
                              <span className="text-[13px]">🌐</span>
                              <span className="text-[13px]">كل مدن المنطقة</span>
                              {isRegionSelected && <span className="mr-auto text-[11px] text-primary">✓ محدد</span>}
                            </button>

                            {region.cities.map((c) => {
                              const isCitySelected = selectionMode === "city" && c.name === city;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => handleSelectCity(c.name)}
                                  className={`touch-target w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                                    isCitySelected ? "bg-primary/10 text-primary font-bold" : "text-foreground active:bg-secondary"
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                  <span className="text-[13px]">{c.name}</span>
                                  {isCitySelected && <span className="mr-auto text-[11px] text-primary">✓ محدد</span>}
                                </button>
                              );
                            })}

                            {region.cities.length === 0 && (
                              <p className="text-[12px] text-muted-foreground px-4 py-2">لا توجد مدن في هذه المنطقة</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
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
