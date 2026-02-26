import { useRef, useState } from "react";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFeaturedAds } from "@/data/ads";
import { useCity } from "@/contexts/CityContext";

const FeaturedSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { city } = useCity();
  const featured = getFeaturedAds(city);

  const slides = featured.slice(0, 5).map((ad) => ({
    id: ad.id,
    image: ad.images[0],
    title: ad.offer,
    subtitle: ad.shopName,
    cta: "شاهد التفاصيل",
  }));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
    const cardWidth = el.clientWidth * 0.78 + 12;
    const index = Math.round(scrollRight / cardWidth);
    setActiveIndex(slides.length - 1 - index);
  };

  if (slides.length === 0) return null;

  return (
    <section className="pt-4">
      <div className="px-5 mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">إعلانات مميزة</h2>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-5 snap-x snap-mandatory hide-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="snap-center shrink-0 w-[78%] rounded-2xl overflow-hidden shadow-slider relative aspect-[16/9] cursor-pointer"
            onClick={() => navigate(`/ad/${slide.id}`)}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-4">
              <span className="inline-block text-[10px] font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-md mb-2">
                {slide.subtitle}
              </span>
              <h3 className="text-primary-foreground text-[17px] font-bold mb-2.5 leading-snug">{slide.title}</h3>
              <button className="touch-target inline-flex items-center gap-1.5 bg-primary-foreground text-foreground px-4 py-2 rounded-xl font-bold text-[13px] shadow-card active:scale-95 transition-transform">
                <Phone className="w-3.5 h-3.5" />
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        <div className="shrink-0 w-2" />
      </div>
    </section>
  );
};

export default FeaturedSlider;
