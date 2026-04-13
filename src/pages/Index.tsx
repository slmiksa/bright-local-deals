import TopBar from "@/components/TopBar";
import FeaturedSlider from "@/components/FeaturedSlider";
import CategoriesRow from "@/components/CategoriesRow";
import EventsSlider from "@/components/EventsSlider";
import AdSection from "@/components/AdSection";
import PullToRefresh from "@/components/PullToRefresh";
import CountdownTimer from "@/components/CountdownTimer";
import BannerSlider from "@/components/BannerSlider";
import GiveawaySection from "@/components/GiveawaySection";
import ComingSoonSection from "@/components/ComingSoonSection";
import { useAdsByCity } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";

const Index = () => {
  const { city, selectionMode, regionName, regionCities } = useCity();
  const isRegionMode = selectionMode === "region";
  const { data: sections = [], isLoading } = useAdsByCity(
    isRegionMode ? "" : city,
    { cities: isRegionMode ? regionCities : undefined }
  );

  const displayKey = isRegionMode ? regionName : city;

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto relative" key={displayKey}>
      <TopBar />
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 60px)' }} />
      <CountdownTimer />
      <BannerSlider />
      <GiveawaySection />
      <ComingSoonSection />
      <FeaturedSlider />
      <EventsSlider />
      <CategoriesRow />
      {sections.filter(s => s.id !== "events").map((section) => (
        <AdSection key={section.id} {...section} showCity={isRegionMode} scrollContextKey={displayKey || "all"} />
      ))}
      {!isLoading && sections.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-[15px]">
            لا توجد إعلانات في {isRegionMode ? regionName : city} حالياً
          </p>
        </div>
      )}
      <div className="h-8" />
    </PullToRefresh>
  );
};

export default Index;
