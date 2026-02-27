import { Search, MapPin, ChevronDown, X } from "lucide-react";
import { useCity } from "@/contexts/CityContext";
import { cities, allAds } from "@/data/ads";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { city, setCity } = useCity();
  const [showCities, setShowCities] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allAds
      .filter((ad) => ad.city === city)
      .filter(
        (ad) =>
          ad.shopName.toLowerCase().includes(q) ||
          ad.offer.toLowerCase().includes(q) ||
          ad.description.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [query, city]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={() => setShowCities(true)}
            className="flex items-center gap-2.5 active:opacity-70 transition-opacity">
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
            <button
              onClick={() => { setShowSearch(true); setQuery(""); }}
              className="touch-target flex items-center justify-center w-10 h-10 rounded-xl bg-primary transition-colors active:opacity-80"
            >
              <Search className="w-[18px] h-[18px] text-primary-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Sheet */}
      {showSearch && (
        <div className="fixed inset-0 z-[100]" onClick={() => setShowSearch(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div
            className="absolute top-0 left-0 right-0 bg-card max-w-[430px] mx-auto animate-in slide-in-from-top duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-4 pb-3 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن متجر أو عرض..."
                  className="w-full h-11 pr-10 pl-4 rounded-xl bg-secondary text-foreground text-[14px] placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="touch-target w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-muted"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {query.trim() && (
              <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="space-y-1.5">
                    {results.map((ad) => (
                      <button
                        key={ad.id}
                        onClick={() => { setShowSearch(false); navigate(`/ad/${ad.id}`); }}
                        className="touch-target w-full flex items-center gap-3 p-3 rounded-xl active:bg-secondary transition-colors text-right"
                      >
                        <img
                          src={ad.images[0]}
                          alt={ad.shopName}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-foreground truncate">{ad.shopName}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{ad.offer}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-[14px] py-8">لا توجد نتائج</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
