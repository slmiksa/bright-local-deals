import { useRef } from "react";
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

  return (
    <section className="pt-4">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="snap-center shrink-0 w-[85%] rounded-2xl overflow-hidden shadow-elevated relative aspect-[16/9]"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-4">
              <p className="text-primary-foreground/80 text-xs font-medium mb-0.5">
                {slide.subtitle}
              </p>
              <h2 className="text-primary-foreground text-lg font-bold mb-2">
                {slide.title}
              </h2>
              <button className="touch-target inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm">
                <Phone className="w-4 h-4" />
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        {/* spacer for last card padding */}
        <div className="shrink-0 w-1" />
      </div>
    </section>
  );
};

export default FeaturedSlider;
