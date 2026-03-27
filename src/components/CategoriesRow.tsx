import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryIcon } from "@/lib/categoryIcons";

const CategoriesRow = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name, icon").order("sort_order");
      return data || [];
    },
  });

  return (
    <section className="px-5 pt-6 pb-1">
      <h2 className="text-base font-bold text-foreground mb-3">تصنيفات الإعلانات</h2>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.id, cat.icon);
          return (
            <button
              key={cat.id}
              className="touch-target flex flex-col items-center gap-1.5 py-2 rounded-2xl bg-card shadow-card active:scale-[0.97] transition-transform"
              onClick={() => {
                document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <div className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-primary">
                <Icon className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesRow;
