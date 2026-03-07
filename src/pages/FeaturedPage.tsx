import { Star } from "lucide-react";
import AdCard from "@/components/AdCard";
import { useFeaturedAds } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";
import PullToRefresh from "@/components/PullToRefresh";
import TopBar from "@/components/TopBar";

const FeaturedPage = () => {
  const { city } = useCity();
  const { data: featured = [], isLoading } = useFeaturedAds(city);

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <TopBar />
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 60px)' }} />

      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        {featured.map((ad) => (
          <AdCard key={ad.id} {...ad} />
        ))}
      </div>

      {!isLoading && featured.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">لا توجد إعلانات مميزة في {city}</p>
        </div>
      )}
    </PullToRefresh>
  );
};

export default FeaturedPage;
