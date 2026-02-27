import TopBar from "@/components/TopBar";
import FeaturedSlider from "@/components/FeaturedSlider";
import CategoriesRow from "@/components/CategoriesRow";
import EventsSlider from "@/components/EventsSlider";
import AdSection from "@/components/AdSection";
import PullToRefresh from "@/components/PullToRefresh";
import { useAdsByCity } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { city } = useCity();
  const { data: sections = [], isLoading } = useAdsByCity(city);

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto relative">
      <TopBar />
      <FeaturedSlider />
      <EventsSlider />
      <CategoriesRow />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {sections.map((section) => (
            <AdSection key={section.id} {...section} />
          ))}
          {sections.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-[15px]">لا توجد إعلانات في {city} حالياً</p>
            </div>
          )}
        </>
      )}
      <div className="h-8" />
    </PullToRefresh>
  );
};

export default Index;
