import { Monitor, Coffee, Flower2, Sofa, UtensilsCrossed, Gem } from "lucide-react";

const categories = [
{ icon: Monitor, label: "إلكترونيات", id: "electronics", color: "158 45% 42%" },
{ icon: Coffee, label: "كافيهات", id: "cafes", color: "25 80% 55%" },
{ icon: Flower2, label: "عطور", id: "perfumes", color: "320 50% 50%" },
{ icon: Sofa, label: "مفروشات", id: "furniture", color: "30 40% 50%" },
{ icon: UtensilsCrossed, label: "مأكولات", id: "food", color: "0 65% 55%" },
{ icon: Gem, label: "مناسبات", id: "events", color: "270 45% 55%" }];


const CategoriesRow = () => {
  return (
    <section className="px-5 pt-6 pb-1">
      <h2 className="text-base font-bold text-foreground mb-3">​تصنيفات الإعلانات </h2>
      <div className="grid grid-cols-3 gap-2.5">
        {categories.map((cat) =>
        <button
          key={cat.id}
          className="touch-target flex flex-col items-center gap-2 py-3 rounded-2xl bg-card shadow-card active:scale-[0.97] transition-transform"
          onClick={() => {
            document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>

            <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center"
            style={{ backgroundColor: `hsl(${cat.color} / 0.12)` }}>

              <cat.icon
              className="w-5 h-5"
              style={{ color: `hsl(${cat.color})` }} />

            </div>
            <span className="text-[12px] font-semibold text-foreground">
              {cat.label}
            </span>
          </button>
        )}
      </div>
    </section>);

};

export default CategoriesRow;