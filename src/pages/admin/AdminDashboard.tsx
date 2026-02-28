import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, FolderOpen, MapPin, Eye } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ ads: 0, categories: 0, cities: 0, totalViews: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [adsRes, catsRes, citiesRes, statsRes] = await Promise.all([
        supabase.from("ads").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("cities").select("id", { count: "exact", head: true }),
        supabase.from("ad_stats").select("views"),
      ]);
      const totalViews = (statsRes.data || []).reduce((sum, s) => sum + (s.views || 0), 0);
      setStats({
        ads: adsRes.count || 0,
        categories: catsRes.count || 0,
        cities: citiesRes.count || 0,
        totalViews,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "إجمالي الإعلانات", value: stats.ads, icon: Megaphone, color: "bg-primary/10 text-primary" },
    { label: "التصنيفات", value: stats.categories, icon: FolderOpen, color: "bg-accent/10 text-accent-foreground" },
    { label: "المدن", value: stats.cities, icon: MapPin, color: "bg-secondary text-foreground" },
    { label: "إجمالي المشاهدات", value: stats.totalViews, icon: Eye, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div>
      <h1 className="text-xl font-black text-foreground mb-6">نظرة عامة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className="text-3xl font-black text-foreground">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
