import { useNavigate } from "react-router-dom";
import { Smartphone, CupSoda, SprayCan, Lamp, ChefHat, PartyPopper, ChevronLeft } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
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

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name, icon").order("sort_order");
      return data || [];
    },
  });

  return (
    <PullToRefresh className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5">
          <h1 className="text-lg font-bold text-foreground">التصنيفات</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-2.5">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.id] || Smartphone;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className="touch-target w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary">
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="flex-1 text-[15px] font-bold text-foreground text-right">{cat.name}</span>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </PullToRefresh>
  );
};

export default CategoriesPage;
