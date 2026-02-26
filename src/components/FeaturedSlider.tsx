import { useRef, useState } from "react";
import { Phone } from "lucide-react";
import featuredCoffee from "@/assets/featured-coffee.jpg";
import featuredElectronics from "@/assets/featured-electronics.jpg";
import featuredPerfume from "@/assets/featured-perfume.jpg";

const slides = [
  {
    id: 1,
    image: featuredCoffee,
    title: "أجواء قهوة استثنائية",
    subtitle: "كافيه الديوان",
    cta: "اتصل الآن",
  },
  {
    id: 2,
    image: featuredElectronics,
    title: "أحدث الأجهزة بأفضل سعر",
    subtitle: "متجر التقنية",
    cta: "اطلب الآن",
  },
  {
    id: 3,
    image: featuredPerfume,
    title: "عطور فاخرة بتوقيع عربي",
    subtitle: "دار العود",
    cta: "شاهد العرض",
  },
];

const FeaturedSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
    // RTL: scrollRight is 0 at the start, max at the end
    const cardWidth = el.clientWidth * 0.78 + 12;
    const index = Math.round(scrollRight / cardWidth);
    // Reverse because RTL
    setActiveIndex(slides.length - 1 - index);
  };

  return (
    <section className="pt-4">
      <div className="px-5 mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">إعلانات مميزة</h2>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/25"
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
            className="snap-center shrink-0 w-[78%] rounded-2xl overflow-hidden shadow-slider relative aspect-[16/9]"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-4">
              <span className="inline-block text-[10px] font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-md mb-2">
                {slide.subtitle}
              </span>
              <h3 className="text-primary-foreground text-[17px] font-bold mb-2.5 leading-snug">
                {slide.title}
              </h3>
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
