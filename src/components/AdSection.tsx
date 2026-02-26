import { motion } from "framer-motion";
import AdCard from "./AdCard";

interface Ad {
  id: number;
  image: string;
  shopName: string;
  offer: string;
  featured?: boolean;
}

interface AdSectionProps {
  id: string;
  title: string;
  ads: Ad[];
}

const AdSection = ({ id, title, ads }: AdSectionProps) => {
  return (
    <section id={id} className="px-4 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg text-foreground">{title}</h2>
        <button className="touch-target text-sm font-semibold text-primary">
          عرض الكل
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        {ads.map((ad) => (
          <AdCard key={ad.id} {...ad} />
        ))}
      </motion.div>
    </section>
  );
};

export default AdSection;
