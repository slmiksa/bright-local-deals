import { useState, useEffect } from "react";
import { ArrowRight, Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AdRow, AdInsert } from "@/types/database";

type Ad = AdRow;

const categories = [
  { value: "electronics", label: "💻 إلكترونيات" },
  { value: "cafes", label: "☕ كافيهات" },
  { value: "perfumes", label: "🌸 عطور وروائح" },
  { value: "furniture", label: "🛋 مفروشات" },
  { value: "food", label: "🍔 مأكولات" },
  { value: "events", label: "💍 أفراح ومناسبات" },
];

const cities = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "أبها", "تبوك", "بريدة", "حائل",
];

const emptyAd: Omit<AdInsert, "images"> & { images: string[] } = {
  shop_name: "", offer: "", featured: false, category: "electronics",
  city: "الرياض", phone: "", description: "", lat: 24.7136, lng: 46.6753, address: "", images: [],
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [formData, setFormData] = useState(emptyAd);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      toast({ title: "غير مصرح", description: "ليس لديك صلاحية الوصول", variant: "destructive" });
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchAds = async () => {
    setLoading(true);
    const { data } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
    setAds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchAds();
  }, [isAdmin]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("ad-images").upload(path, file);
      if (error) {
        toast({ title: "خطأ", description: `فشل رفع ${file.name}`, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
      newImages.push(urlData.publicUrl);
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!formData.shop_name || !formData.offer || formData.images.length === 0) {
      toast({ title: "تنبيه", description: "يرجى تعبئة جميع الحقول المطلوبة وإضافة صورة واحدة على الأقل", variant: "destructive" });
      return;
    }
    setSaving(true);

    if (editing) {
      const { error } = await supabase.from("ads").update(formData).eq("id", editing.id);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم التحديث", description: "تم تحديث الإعلان بنجاح" });
      }
    } else {
      const { error } = await supabase.from("ads").insert(formData);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تمت الإضافة", description: "تمت إضافة الإعلان بنجاح" });
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setFormData(emptyAd);
    fetchAds();
  };

  const handleEdit = (ad: Ad) => {
    setEditing(ad);
    setFormData({
      shop_name: ad.shop_name, offer: ad.offer, featured: ad.featured,
      category: ad.category, city: ad.city, phone: ad.phone,
      description: ad.description, lat: ad.lat, lng: ad.lng,
      address: ad.address, images: ad.images,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل تريد حذف هذا الإعلان؟")) return;
    await supabase.from("ads").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    fetchAds();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="touch-target">
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setFormData(emptyAd); }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[13px] font-bold"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center">
          <div className="bg-card w-full max-w-[430px] rounded-t-3xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[16px] font-bold text-foreground">{editing ? "تعديل إعلان" : "إعلان جديد"}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground text-[13px]">إلغاء</button>
            </div>

            {/* Images */}
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-2">الصور</label>
              <div className="flex gap-2 flex-wrap">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px]">×</button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">رفع</span>
                  </>}
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">اسم المتجر *</label>
              <input value={formData.shop_name} onChange={(e) => setFormData(p => ({ ...p, shop_name: e.target.value }))}
                className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">العرض *</label>
              <input value={formData.offer} onChange={(e) => setFormData(p => ({ ...p, offer: e.target.value }))}
                className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">الوصف</label>
              <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">القسم</label>
                <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">المدينة</label>
                <select value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                  className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">الهاتف</label>
                <input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} dir="ltr"
                  className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">العنوان</label>
                <input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-background rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData(p => ({ ...p, featured: e.target.checked }))} className="w-5 h-5 rounded accent-primary" />
              <span className="text-[14px] font-bold text-foreground">إعلان مميز ⭐</span>
            </label>

            <button onClick={handleSave} disabled={saving}
              className="touch-target w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated disabled:opacity-50">
              {saving ? "جاري الحفظ..." : editing ? "تحديث الإعلان" : "إضافة الإعلان"}
            </button>
          </div>
        </div>
      )}

      {/* Ads List */}
      <div className="px-5 pt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-[14px]">لا توجد إعلانات بعد</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="bg-card rounded-2xl border border-border p-4 flex gap-3">
              <img src={ad.images[0]} alt={ad.shop_name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-foreground truncate">{ad.shop_name}</h3>
                  {ad.featured && <span className="text-[10px] bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] px-2 py-0.5 rounded-md font-bold">مميز</span>}
                </div>
                <p className="text-[12px] text-muted-foreground truncate">{ad.offer}</p>
                <p className="text-[11px] text-muted-foreground">{ad.city} • {categories.find(c => c.value === ad.category)?.label}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => handleEdit(ad)} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-primary" />
                </button>
                <button onClick={() => handleDelete(ad.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
