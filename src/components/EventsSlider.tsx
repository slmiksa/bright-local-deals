import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Eye, PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEventAds, Ad } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";
import { createPortal } from "react-dom";

const EventsSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedAd, setExpandedAd] = useState<Ad | null>(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const navigate = useNavigate();
  const { city } = useCity();

  const { data: events = [] } = useEventAds(city);

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <PartyPopper className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-base font-bold text-foreground">اعلانات محال الزينة والأفراح</h2>
        </div>
        <button
          onClick={() => navigate("/category/events")}
          className="touch-target flex items-center gap-0.5 text-[13px] font-semibold text-primary active:opacity-70 transition-opacity">
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-5 snap-x snap-mandatory hide-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}>
        {events.map((ad) =>
          <div
            key={ad.id}
            className="snap-center shrink-0 w-[45%] rounded-2xl overflow-hidden relative cursor-pointer active:scale-[0.97] transition-transform"
            style={{ aspectRatio: "9/16" }}
            onClick={() => {setExpandedAd(ad);setExpandedImageIndex(0);}}>
            <img src={ad.images[0]} alt={ad.shopName} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-3">
              <span className="inline-block text-[9px] font-bold bg-white/90 text-foreground px-2 py-0.5 rounded-md mb-1.5 backdrop-blur-sm">
                {ad.shopName}
              </span>
              <h3 className="text-white text-[13px] font-bold leading-snug line-clamp-2 drop-shadow-md">{ad.offer}</h3>
            </div>
          </div>
        )}
        <div className="shrink-0 w-2" />
      </div>
      {events.length > 1 &&
        <div className="flex justify-center gap-1.5 mt-3">
          {events.map((_, i) =>
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25"}`
              } />
          )}
        </div>
      }

      {expandedAd && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setExpandedAd(null)}>
          <button
            onClick={() => setExpandedAd(null)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          <div
            className="w-full max-w-[380px] px-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {touchStartX.current = e.touches[0].clientX;touchDeltaX.current = 0;}}
            onTouchMove={(e) => {touchDeltaX.current = e.touches[0].clientX - touchStartX.current;}}
            onTouchEnd={() => {
              if (!expandedAd) return;
              const threshold = 50;
              if (touchDeltaX.current > threshold) {
                setExpandedImageIndex((i) => i > 0 ? i - 1 : expandedAd.images.length - 1);
              } else if (touchDeltaX.current < -threshold) {
                setExpandedImageIndex((i) => i < expandedAd.images.length - 1 ? i + 1 : 0);
              }
              touchDeltaX.current = 0;
            }}>
            <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: "9/16" }}>
              <img src={expandedAd.images[expandedImageIndex]} alt={expandedAd.shopName} className="w-full h-full object-cover" />
              {expandedAd.images.length > 1 &&
                <>
                  <button
                    onClick={() => setExpandedImageIndex((i) => i > 0 ? i - 1 : expandedAd.images.length - 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setExpandedImageIndex((i) => i < expandedAd.images.length - 1 ? i + 1 : 0)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {expandedAd.images.map((_, i) =>
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === expandedImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
                    )}
                  </div>
                </>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-5">
                <span className="inline-block text-[11px] font-bold bg-white/90 text-foreground px-2.5 py-1 rounded-lg mb-2 backdrop-blur-sm">
                  {expandedAd.shopName}
                </span>
                <h3 className="text-white text-lg font-bold mb-4 leading-snug">{expandedAd.offer}</h3>
                <button
                  onClick={() => {setExpandedAd(null);navigate(`/ad/${expandedAd.id}`);}}
                  className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-[14px] active:scale-[0.97] transition-transform shadow-elevated">
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
