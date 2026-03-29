import { Search, ArrowRight } from "lucide-react";
import { useCity } from "@/contexts/CityContext";
import { useAdsByCity } from "@/hooks/useAds";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const { city, selectionMode, regionCities } = useCity();
  const isRegionMode = selectionMode === "region";
  const [query, setQuery] = useState("");
  const { data: sections = [] } = useAdsByCity(
    isRegionMode ? "" : city,
    { cities: isRegionMode ? regionCities : undefined }
  );
  const navigate = useNavigate();

  const allAdsInCity = useMemo(() => sections.flatMap((s) => s.ads), [sections]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allAdsInCity
      .filter(
        (ad) =>
          ad.shopName.toLowerCase().includes(q) ||
          ad.offer.toLowerCase().includes(q) ||
          ad.description.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, allAdsInCity]);

  return (
    <div className="min-h-screen bg-background pt-[env(safe-area-inset-top,0px)]" dir="rtl">
      {/* Search header - below the main TopBar */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="touch-target w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-muted shrink-0"
          >
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
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
        </div>
        <p className="text-[12px] text-muted-foreground mt-2 px-1">
          البحث في: <span className="font-bold text-foreground">{city}</span>
        </p>
      </div>

      {/* Results */}
      <div className="px-4 pb-32">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-[14px]">ابحث عن متجر، عرض، أو وصف</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-1.5">
            {results.map((ad) => (
              <button
                key={ad.id}
                onClick={() => navigate(`/ad/${ad.id}`)}
                className="touch-target w-full flex items-center gap-3 p-3 rounded-xl active:bg-secondary transition-colors text-right"
              >
                <img src={ad.images[0]} alt={ad.shopName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-foreground truncate">{ad.shopName}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{ad.offer}</p>
                  <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{ad.category}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-[14px]">لا توجد نتائج لـ "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
