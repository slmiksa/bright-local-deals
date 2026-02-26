import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import FeaturedSlider from "@/components/FeaturedSlider";
import CategoriesRow from "@/components/CategoriesRow";
import EventsSlider from "@/components/EventsSlider";
import AdSection from "@/components/AdSection";
import { getAdsByCity } from "@/data/ads";
import { useCity } from "@/contexts/CityContext";

const Index = () => {
  const { city } = useCity();
  const [refreshing, setRefreshing] = useState(false);
  const sections = getAdsByCity(city);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }, []);

  // Pull to refresh
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setPulling(true);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (pulling && e.changedTouches[0].clientY - startY > 80) {
      handleRefresh();
    }
    setPulling(false);
  };

  return (
    <div
      className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto relative"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {refreshing && (
        <div className="flex items-center justify-center py-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <TopBar />
      <FeaturedSlider />
      <EventsSlider />
      <CategoriesRow />
      {sections.map((section) => (
        <AdSection key={section.id} {...section} />
      ))}
      {sections.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-[15px]">لا توجد إعلانات في {city} حالياً</p>
        </div>
      )}
      <div className="h-8" />
    </div>
  );
};

export default Index;
