import { Star, Loader2 } from "lucide-react";
import AdCard from "@/components/AdCard";
import { useFeaturedAds } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";
import PullToRefresh from "@/components/PullToRefresh";

const FeaturedPage = () => {
  const { city } = useCity();
  const { data: featured = [], isLoading } = useFeaturedAds(city);

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5 flex items-center gap-2">
          <Star className="w-5 h-5 text-gold" />
          <h1 className="text-lg font-bold text-foreground">الإعلانات المميزة</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-5 pt-5 grid grid-cols-2 gap-3">
          {featured.map((ad) => (
            <AdCard key={ad.id} id={ad.id} images={ad.images} shop_name={ad.shop_name} offer={ad.offer} featured={ad.featured} />
          ))}
        </div>
      )}

      {!isLoading && featured.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">لا توجد إعلانات مميزة في {city}</p>
        </div>
      )}
    </PullToRefresh>
  );
};

export default FeaturedPage;
