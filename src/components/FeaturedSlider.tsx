import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="px-4 pt-4">
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-elevated">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-5">
              <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                {slides[current].subtitle}
              </p>
              <h2 className="text-primary-foreground text-xl font-bold mb-3">
                {slides[current].title}
              </h2>
              <button className="touch-target inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm">
                <Phone className="w-4 h-4" />
                {slides[current].cta}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-primary-foreground w-5"
                  : "bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSlider;
