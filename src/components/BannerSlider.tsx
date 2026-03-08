import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";

interface BannerSlide {
  id: string;
  image_url: string;
  city: string;
  link_url: string | null;
  link_type: string;
  active: boolean;
  sort_order: number;
}

const BannerSlider = () => {
  const { city } = useCity();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  const { data: slides = [] } = useQuery({
    queryKey: ["banner_slides", city],
    queryFn: async () => {
      const { data } = await supabase
        .from("banner_slides")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });

      return ((data as BannerSlide[]) || []).filter(
        (s) => s.city === "all" || s.city === city
      );
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleClick = (slide: BannerSlide) => {
    if (!slide.link_url) return;
    if (slide.link_type === "external") {
      window.open(slide.link_url, "_blank");
    } else if (slide.link_type === "internal") {
      navigate(slide.link_url);
    }
  };

  if (slides.length === 0) return null;

  return (
    <div className="mx-4 mt-4">
      <Carousel
        opts={{ direction: "rtl", loop: true }}
        plugins={[autoplayPlugin.current]}
        className="w-full"
        setApi={(api) => {
          api?.on("select", () => {
            setCurrentIndex(api.selectedScrollSnap());
          });
        }}
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div
                onClick={() => handleClick(slide)}
                className={`rounded-2xl overflow-hidden ${slide.link_url ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
              >
                <img
                  src={slide.image_url}
                  alt=""
                  className="w-full h-auto rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
