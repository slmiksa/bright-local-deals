import { useRef, useState } from "react";
import { ChevronLeft, PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEventAds } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";
import ImageLightbox from "./ImageLightbox";

const EventsSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const navigate = useNavigate();
  const { city, selectionMode, regionCities } = useCity();
  const isRegionMode = selectionMode === "region";

  const { data: events = [] } = useEventAds(isRegionMode ? "" : city, isRegionMode ? regionCities : undefined);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
    const cardWidth = el.clientWidth * 0.48 + 12;
    const index = Math.round(scrollRight / cardWidth);
    setActiveIndex(events.length - 1 - index);
  };

  const openLightbox = (adImages: string[], index: number) => {
    setLightboxImages(adImages);
    setLightboxIndex(index);
  };

  if (events.length === 0) return null;

  return (
    <section className="pt-7">
      <div className="px-5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <PartyPopper className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-base font-bold text-foreground">اعلانات دعوات الزواج</h2>
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
            onClick={() => openLightbox(ad.images, 0)}>
            <img src={ad.images[0]} alt={ad.shopName} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-3">
              <span className="inline-block text-[9px] font-bold bg-white/90 text-foreground px-2 py-0.5 rounded-md mb-1.5 backdrop-blur-sm">
                {ad.shopName}
              </span>
              {(ad.displayCity || (isRegionMode && ad.city)) && (
                <span className="inline-block text-[8px] font-bold bg-white/70 text-muted-foreground px-1.5 py-0.5 rounded-md mb-1 mr-1 backdrop-blur-sm">
                  📍 {ad.displayCity || ad.city}
                </span>
              )}
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

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}
    </section>
  );
};

export default EventsSlider;