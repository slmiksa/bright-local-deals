import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Smartphone, CupSoda, SprayCan, Lamp, ChefHat, PartyPopper } from "lucide-react";
import AdCard from "@/components/AdCard";
import { allAds, categoryMap } from "@/data/ads";
import { useCity } from "@/contexts/CityContext";
import PullToRefresh from "@/components/PullToRefresh";

const categoryIcons: Record<string, React.ElementType> = {
  electronics: Smartphone,
  cafes: CupSoda,
  perfumes: SprayCan,
  furniture: Lamp,
  food: ChefHat,
  events: PartyPopper,
};

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { city } = useCity();

  const ads = allAds.filter((ad) => ad.category === id && ad.city === city);
  const title = categoryMap[id || ""] || "القسم";
  const Icon = categoryIcons[id || ""];

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="touch-target w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-muted transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-[16px] font-bold text-foreground">{title}</h1>
        </div>
      </div>

      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        {ads.map((ad) => (
          <AdCard key={ad.id} {...ad} />
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">لا توجد إعلانات في {city} لهذا القسم</p>
        </div>
      )}
    </PullToRefresh>
  );
};

export default CategoryPage;
