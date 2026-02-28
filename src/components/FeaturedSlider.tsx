import { useRef, useState } from "react";
import { Eye, Sparkles, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFeaturedAds } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";

const FeaturedSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { city } = useCity();
  const { data: featured = [] } = useFeaturedAds(city);

  const slides = featured.slice(0, 5).map((ad) => ({
    id: ad.id,
    image: ad.images[0],
    title: ad.offer,
    subtitle: ad.shopName
  }));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
    const cardWidth = el.clientWidth * 0.88 + 16;
    const index = Math.round(scrollRight / cardWidth);
    setActiveIndex(slides.length - 1 - index);
  };

  if (slides.length === 0) return null;

  return (
    <section className="pt-5">
      {/* Header */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(40,65%,42%)] flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-[17px] font-extrabold text-foreground">إعلانات لمحة المميزة</h2>
        </div>
        <button
          onClick={() => navigate("/featured")}
          className="touch-target flex items-center gap-0.5 text-[13px] font-semibold text-primary active:opacity-70 transition-opacity">
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto px-5 snap-x snap-mandatory hide-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}>
        {slides.map((slide) =>
          <div
            key={slide.id}
            className="snap-center shrink-0 w-[88%] rounded-3xl overflow-hidden relative cursor-pointer group"
            style={{ aspectRatio: "3/4" }}
            onClick={() => navigate(`/ad/${slide.id}`)}>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-500 group-active:scale-105"
              loading="lazy" />
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                boxShadow: "inset 0 0 0 2px hsl(40, 60%, 62%), 0 8px 40px -8px hsla(40, 60%, 40%, 0.35)"
              }} />
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(40,65%,42%)] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg">
              <Sparkles className="w-3 h-3" />
              مميز
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24 pb-5 px-5">
              <span className="inline-block text-[11px] font-bold bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg mb-2.5">
                {slide.subtitle}
              </span>
              <h3 className="text-white text-[18px] font-extrabold mb-4 leading-snug line-clamp-2 drop-shadow-md">
                {slide.title}
              </h3>
              <button className="touch-target w-full flex items-center justify-center gap-2 bg-white text-foreground py-3.5 rounded-2xl font-bold text-[14px] active:scale-[0.97] transition-transform shadow-xl">
                <Eye className="w-4.5 h-4.5" />
                شاهد التفاصيل
              </button>
            </div>
          </div>
        )}
        <div className="shrink-0 w-2" />
      </div>

      {/* Dots */}
      {slides.length > 1 &&
        <div className="flex justify-center gap-1.5 mt-4">
          {slides.map((_, i) =>
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ?
                "w-6 bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(40,65%,42%)]" :
                "w-2 bg-muted-foreground/20"}`
              } />
          )}
        </div>
      }
    </section>
  );
};

export default FeaturedSlider;
