import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Smartphone, CupSoda, SprayCan, Lamp, ChefHat, PartyPopper } from "lucide-react";
import AdCard from "@/components/AdCard";
import { useAdsByCategory } from "@/hooks/useAds";
import { useCity } from "@/contexts/CityContext";
import PullToRefresh from "@/components/PullToRefresh";
import TopBar from "@/components/TopBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: ads = [], isLoading } = useAdsByCategory(id || "", city);
  const { data: category } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").eq("id", id || "").maybeSingle();
      return data;
    },
    enabled: !!id,
  });
  const title = category?.name || "القسم";
  const Icon = categoryIcons[id || ""];

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <TopBar />
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 60px)' }} />
          <h1 className="text-[16px] font-bold text-foreground">{title}</h1>
        </div>
      </div>

      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        {ads.map((ad) => (
          <AdCard key={ad.id} {...ad} />
        ))}
      </div>

      {!isLoading && ads.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">لا توجد إعلانات في {city} لهذا القسم</p>
        </div>
      )}
    </PullToRefresh>
  );
};

export default CategoryPage;
