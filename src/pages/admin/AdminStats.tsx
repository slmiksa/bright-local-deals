import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Heart, TrendingUp } from "lucide-react";

interface AdStat {
  ad_id: number;
  views: number;
  likes: number;
  shop_name?: string;
}

const AdminStats = () => {
  const [stats, setStats] = useState<AdStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: statsData } = await supabase.from("ad_stats").select("ad_id, views, likes").order("views", { ascending: false });
      const { data: adsData } = await supabase.from("ads").select("id, shop_name");
      const adsMap = new Map((adsData || []).map(a => [a.id, a.shop_name]));
      setStats((statsData || []).map(s => ({ ...s, shop_name: adsMap.get(s.ad_id) || `إعلان #${s.ad_id}` })));
      setLoading(false);
    };
    fetchStats();
  }, []);

  const totalViews = stats.reduce((s, a) => s + a.views, 0);
  const totalLikes = stats.reduce((s, a) => s + a.likes, 0);

  return (
    <div>
      <h1 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> الإحصائيات
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">عدد الإعلانات</p><p className="text-2xl font-black text-foreground">{stats.length}</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-xs text-muted-foreground">إجمالي المشاهدات</p><p className="text-2xl font-black text-foreground">{totalViews.toLocaleString()}</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Heart className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-xs text-muted-foreground">إجمالي الإعجابات</p><p className="text-2xl font-black text-foreground">{totalLikes.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right p-3 font-bold text-foreground">#</th>
              <th className="text-right p-3 font-bold text-foreground">المتجر</th>
              <th className="text-right p-3 font-bold text-foreground">المشاهدات</th>
              <th className="text-right p-3 font-bold text-foreground">الإعجابات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : (
              stats.map((s, i) => (
                <tr key={s.ad_id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-semibold text-foreground">{s.shop_name}</td>
                  <td className="p-3 text-muted-foreground flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {s.views.toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground"><span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {s.likes.toLocaleString()}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStats;
