import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Heart, TrendingUp, Plus, Minus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdStat {
  ad_id: number;
  views: number;
  likes: number;
  fake_views: number;
  shop_name?: string;
  stat_id?: string;
}

const AdminStats = () => {
  const [stats, setStats] = useState<AdStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [fakeInputs, setFakeInputs] = useState<Record<number, string>>({});
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchStats = async () => {
    const { data: statsData } = await supabase.from("ad_stats").select("id, ad_id, views, likes, fake_views").order("views", { ascending: false });
    const { data: adsData } = await supabase.from("ads").select("id, shop_name");
    const adsMap = new Map((adsData || []).map(a => [a.id, a.shop_name]));
    setStats((statsData || []).map(s => ({
      ad_id: s.ad_id,
      views: s.views || 0,
      likes: s.likes || 0,
      fake_views: (s as any).fake_views || 0,
      shop_name: adsMap.get(s.ad_id) || `إعلان #${s.ad_id}`,
      stat_id: s.id,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const handleAddFakeViews = async (adId: number, statId?: string) => {
    const amount = parseInt(fakeInputs[adId] || "0");
    if (!amount || amount <= 0) return;
    setUpdating(adId);
    const current = stats.find(s => s.ad_id === adId);
    const newFake = (current?.fake_views || 0) + amount;
    if (statId) {
      await supabase.from("ad_stats").update({ fake_views: newFake } as any).eq("id", statId);
    } else {
      await supabase.from("ad_stats").insert({ ad_id: adId, views: 0, likes: 0, fake_views: amount } as any);
    }
    toast.success(`تمت إضافة ${amount} مشاهدة وهمية`);
    setFakeInputs(prev => ({ ...prev, [adId]: "" }));
    setUpdating(null);
    fetchStats();
  };

  const handleReduceFakeViews = async (adId: number, statId?: string) => {
    const amount = parseInt(fakeInputs[adId] || "0");
    if (!amount || amount <= 0 || !statId) return;
    setUpdating(adId);
    const current = stats.find(s => s.ad_id === adId);
    const newFake = Math.max(0, (current?.fake_views || 0) - amount);
    await supabase.from("ad_stats").update({ fake_views: newFake } as any).eq("id", statId);
    toast.success(`تم تنقيص ${amount} مشاهدة وهمية`);
    setFakeInputs(prev => ({ ...prev, [adId]: "" }));
    setUpdating(null);
    fetchStats();
  };

  const handleClearFakeViews = async (adId: number, statId?: string) => {
    if (!statId) return;
    setUpdating(adId);
    await supabase.from("ad_stats").update({ fake_views: 0 } as any).eq("id", statId);
    toast.success("تم مسح المشاهدات الوهمية");
    setUpdating(null);
    fetchStats();
  };

  const totalViews = stats.reduce((s, a) => s + a.views, 0);
  const totalFakeViews = stats.reduce((s, a) => s + a.fake_views, 0);
  const totalLikes = stats.reduce((s, a) => s + a.likes, 0);

  return (
    <div>
      <h1 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> الإحصائيات
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">عدد الإعلانات</p><p className="text-2xl font-black text-foreground">{stats.length}</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-xs text-muted-foreground">مشاهدات حقيقية</p><p className="text-2xl font-black text-foreground">{totalViews.toLocaleString()}</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-amber-500" /></div>
          <div><p className="text-xs text-muted-foreground">مشاهدات وهمية</p><p className="text-2xl font-black text-foreground">{totalFakeViews.toLocaleString()}</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Heart className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-xs text-muted-foreground">إجمالي الإعجابات</p><p className="text-2xl font-black text-foreground">{totalLikes.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right p-3 font-bold text-foreground">#</th>
                <th className="text-right p-3 font-bold text-foreground">المتجر</th>
                <th className="text-right p-3 font-bold text-foreground">حقيقي</th>
                <th className="text-right p-3 font-bold text-foreground">وهمي</th>
                <th className="text-right p-3 font-bold text-foreground">الإجمالي</th>
                <th className="text-right p-3 font-bold text-foreground">الإعجابات</th>
                <th className="text-right p-3 font-bold text-foreground min-w-[200px]">إضافة وهمي</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : (
                stats.map((s, i) => (
                  <tr key={s.ad_id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-semibold text-foreground">{s.shop_name}</td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-500" /> {s.views.toLocaleString()}</span>
                    </td>
                    <td className="p-3 text-amber-600 font-medium">{s.fake_views.toLocaleString()}</td>
                    <td className="p-3 font-bold text-foreground">{(s.views + s.fake_views).toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {s.likes.toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="العدد"
                          value={fakeInputs[s.ad_id] || ""}
                          onChange={(e) => setFakeInputs(prev => ({ ...prev, [s.ad_id]: e.target.value }))}
                          className="w-24 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3"
                          disabled={updating === s.ad_id}
                          onClick={() => handleAddFakeViews(s.ad_id, s.stat_id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
