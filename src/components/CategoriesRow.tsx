import { motion } from "framer-motion";
import { Monitor, Coffee, Flower2, Sofa, UtensilsCrossed, Gem } from "lucide-react";

const categories = [
  { icon: Monitor, label: "إلكترونيات", id: "electronics" },
  { icon: Coffee, label: "كافيهات", id: "cafes" },
  { icon: Flower2, label: "عطور", id: "perfumes" },
  { icon: Sofa, label: "مفروشات", id: "furniture" },
  { icon: UtensilsCrossed, label: "مأكولات", id: "food" },
  { icon: Gem, label: "مناسبات", id: "events" },
];

const CategoriesRow = () => {
  return (
    <section className="px-4 pt-6 pb-2">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="touch-target flex flex-col items-center gap-2 min-w-[72px]"
            onClick={() => {
              document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <cat.icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default CategoriesRow;
