import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/data/imageMap";

interface DbAd {
  id: number;
  shop_name: string;
  offer: string;
  description: string | null;
  category: string;
  city: string;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  featured: boolean | null;
  active: boolean | null;
  ad_images: { id: string; image_url: string; sort_order: number | null }[];
}

interface Category {
  id: string;
  name: string;
}

const emptyForm = {
  shop_name: "",
  offer: "",
  description: "",
  category: "",
  city: "",
  phone: "",
  address: "",
  lat: "",
  lng: "",
  featured: false,
  active: true,
  image_urls: "",
};

const AdminAds = () => {
  const [ads, setAds] = useState<DbAd[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const fetchAds = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ads")
      .select("*, ad_images(id, image_url, sort_order)")
      .order("id", { ascending: false });
    setAds((data as unknown as DbAd[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAds();
    supabase.from("categories").select("id, name").then(({ data }) => setCategories(data || []));
    supabase.from("cities").select("name").order("sort_order").then(({ data }) => setCities((data || []).map(c => c.name)));
  }, [fetchAds]);

  const filtered = ads.filter(
    (ad) =>
      ad.shop_name.includes(search) ||
      ad.offer.includes(search) ||
      ad.city.includes(search)
  );

  const openEdit = (ad: DbAd) => {
    setEditId(ad.id);
    setForm({
      shop_name: ad.shop_name,
      offer: ad.offer,
      description: ad.description || "",
      category: ad.category,
      city: ad.city,
      phone: ad.phone || "",
      address: ad.address || "",
      lat: String(ad.lat || ""),
      lng: String(ad.lng || ""),
      featured: ad.featured || false,
      active: ad.active !== false,
      image_urls: ad.ad_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(i => i.image_url).join(", "),
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.shop_name.trim() || !form.offer.trim() || !form.category || !form.city) {
      toast({ title: "خطأ", description: "يرجى تعبئة الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const adData = {
      shop_name: form.shop_name.trim(),
      offer: form.offer.trim(),
      description: form.description.trim() || null,
      category: form.category,
      city: form.city,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      featured: form.featured,
      active: form.active,
    };

    let adId = editId;

    if (editId) {
      const { error } = await supabase.from("ads").update(adData).eq("id", editId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    } else {
      const { data, error } = await supabase.from("ads").insert(adData).select("id").single();
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
      adId = data.id;
    }

    // Handle images
    if (adId) {
      await supabase.from("ad_images").delete().eq("ad_id", adId);
      const imageUrls = form.image_urls.split(",").map(s => s.trim()).filter(Boolean);
      if (imageUrls.length > 0) {
        await supabase.from("ad_images").insert(
          imageUrls.map((url, i) => ({ ad_id: adId!, image_url: url, sort_order: i }))
        );
      }
    }

    toast({ title: "تم", description: editId ? "تم تحديث الإعلان" : "تم إضافة الإعلان" });
    setShowForm(false);
    fetchAds();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    await supabase.from("ad_stats").delete().eq("ad_id", id);
    await supabase.from("ad_images").delete().eq("ad_id", id);
    const { error } = await supabase.from("ads").delete().eq("id", id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم", description: "تم حذف الإعلان" });
    fetchAds();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground">إدارة الإعلانات</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> إضافة إعلان
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..."
          className="w-full h-10 pr-10 pl-4 rounded-xl bg-card text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right p-3 font-bold text-foreground">الصورة</th>
                <th className="text-right p-3 font-bold text-foreground">المتجر</th>
                <th className="text-right p-3 font-bold text-foreground">العرض</th>
                <th className="text-right p-3 font-bold text-foreground">التصنيف</th>
                <th className="text-right p-3 font-bold text-foreground">المدينة</th>
                <th className="text-right p-3 font-bold text-foreground">الحالة</th>
                <th className="text-right p-3 font-bold text-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد إعلانات</td></tr>
              ) : (
                filtered.map((ad) => (
                  <tr key={ad.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      {ad.ad_images[0] && (
                        <img src={resolveImageUrl(ad.ad_images[0].image_url)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                    </td>
                    <td className="p-3 font-semibold text-foreground">{ad.shop_name}</td>
                    <td className="p-3 text-muted-foreground truncate max-w-[150px]">{ad.offer}</td>
                    <td className="p-3 text-muted-foreground">{categories.find(c => c.id === ad.category)?.name || ad.category}</td>
                    <td className="p-3 text-muted-foreground">{ad.city}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ad.active !== false ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {ad.active !== false ? "نشط" : "معطل"}
                      </span>
                      {ad.featured && <span className="mr-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]">مميز</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(ad)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(ad.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg mt-8 mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editId ? "تعديل إعلان" : "إضافة إعلان جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم المتجر *</label>
                <input value={form.shop_name} onChange={(e) => setForm(f => ({...f, shop_name: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">العرض *</label>
                <input value={form.offer} onChange={(e) => setForm(f => ({...f, offer: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} rows={3} className="w-full px-3 py-2 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">التصنيف *</label>
                  <select value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border appearance-none">
                    <option value="">اختر</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">المدينة *</label>
                  <select value={form.city} onChange={(e) => setForm(f => ({...f, city: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border appearance-none">
                    <option value="">اختر</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">الهاتف</label>
                  <input value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">العنوان</label>
                  <input value={form.address} onChange={(e) => setForm(f => ({...f, address: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">خط العرض</label>
                  <input value={form.lat} onChange={(e) => setForm(f => ({...f, lat: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">خط الطول</label>
                  <input value={form.lng} onChange={(e) => setForm(f => ({...f, lng: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">أسماء ملفات الصور (مفصولة بفواصل)</label>
                <input value={form.image_urls} onChange={(e) => setForm(f => ({...f, image_urls: e.target.value}))} placeholder="ad-tech-1.jpg, ad-tech-2.jpg" className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm(f => ({...f, featured: e.target.checked}))} className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-foreground">إعلان مميز</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm(f => ({...f, active: e.target.checked}))} className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-foreground">نشط</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={handleSave} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <Check className="w-4 h-4" /> حفظ
              </button>
              <button onClick={() => setShowForm(false)} className="h-10 px-4 bg-muted text-foreground rounded-xl text-sm font-bold active:scale-95 transition-transform">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAds;
