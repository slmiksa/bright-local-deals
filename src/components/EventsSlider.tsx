import { useRef, useState } from "react";
import { Phone, ChevronLeft, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { allAds } from "@/data/ads";
import { useCity } from "@/contexts/CityContext";
import { createPortal } from "react-dom";

const EventsSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedAd, setExpandedAd] = useState<typeof allAds[0] | null>(null);
  const navigate = useNavigate();
  const { city } = useCity();

  const events = allAds.filter((ad) => ad.category === "events" && ad.city === city);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
    const cardWidth = el.clientWidth * 0.48 + 12;
    const index = Math.round(scrollRight / cardWidth);
    setActiveIndex(events.length - 1 - index);
  };

  if (events.length === 0) return null;

  return (
    <section className="pt-7">
      <div className="px-5 mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">💍 أفراح ومناسبات</h2>
        <button
          onClick={() => navigate("/category/events")}
          className="touch-target flex items-center gap-0.5 text-[13px] font-semibold text-primary active:opacity-70 transition-opacity"
        >
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-5 snap-x snap-mandatory hide-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {events.map((ad) => (
          <div
            key={ad.id}
            className="snap-center shrink-0 w-[45%] rounded-2xl overflow-hidden shadow-slider relative cursor-pointer active:scale-[0.97] transition-transform"
            style={{ aspectRatio: "9/16" }}
            onClick={() => setExpandedAd(ad)}
          >
            <img src={ad.images[0]} alt={ad.shopName} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-3">
              <span className="inline-block text-[9px] font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-md mb-1.5">
                {ad.shopName}
              </span>
              <h3 className="text-primary-foreground text-[13px] font-bold leading-snug line-clamp-2">{ad.offer}</h3>
            </div>
          </div>
        ))}
        <div className="shrink-0 w-2" />
      </div>
      {events.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {events.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      )}

      {/* Expanded overlay */}
      {expandedAd && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setExpandedAd(null)}
        >
          <button
            onClick={() => setExpandedAd(null)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="w-full max-w-[380px] px-4" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: "9/16" }}>
              <img src={expandedAd.images[0]} alt={expandedAd.shopName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-5">
                <span className="inline-block text-[11px] font-bold bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg mb-2">
                  {expandedAd.shopName}
                </span>
                <h3 className="text-white text-lg font-bold mb-4 leading-snug">{expandedAd.offer}</h3>
                <button
                  onClick={() => { setExpandedAd(null); navigate(`/ad/${expandedAd.id}`); }}
                  className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-[14px] active:scale-[0.97] transition-transform shadow-elevated"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default EventsSlider;
