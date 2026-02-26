import { useNavigate } from "react-router-dom";
import { Monitor, Coffee, Flower2, Sofa, UtensilsCrossed, Gem, ChevronLeft } from "lucide-react";

const categories = [
  { icon: Monitor, label: "إلكترونيات", id: "electronics", color: "158 45% 42%" },
  { icon: Coffee, label: "كافيهات", id: "cafes", color: "25 80% 55%" },
  { icon: Flower2, label: "عطور وروائح", id: "perfumes", color: "320 50% 50%" },
  { icon: Sofa, label: "مفروشات", id: "furniture", color: "30 40% 50%" },
  { icon: UtensilsCrossed, label: "مأكولات", id: "food", color: "0 65% 55%" },
  { icon: Gem, label: "مناسبات وزواجات", id: "events", color: "270 45% 55%" },
];

const CategoriesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5">
          <h1 className="text-lg font-bold text-foreground">التصنيفات</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-2.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/category/${cat.id}`)}
            className="touch-target w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card active:scale-[0.98] transition-transform"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `hsl(${cat.color} / 0.12)` }}
            >
              <cat.icon className="w-6 h-6" style={{ color: `hsl(${cat.color})` }} />
            </div>
            <span className="flex-1 text-[15px] font-bold text-foreground text-right">{cat.label}</span>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
