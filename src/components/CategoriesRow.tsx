import { Smartphone, CupSoda, SprayCan, Lamp, ChefHat, PartyPopper } from "lucide-react";
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

const CategoriesRow = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("sort_order");
      return data || [];
    },
  });

  return (
    <section className="px-5 pt-6 pb-1">
      <h2 className="text-base font-bold text-foreground mb-3">تصنيفات الإعلانات</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.id] || Smartphone;
          return (
            <button
              key={cat.id}
              className="touch-target flex flex-col items-center gap-2 py-3 rounded-2xl bg-card shadow-card active:scale-[0.97] transition-transform"
              onClick={() => {
                document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-primary">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-[12px] font-semibold text-foreground">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesRow;
