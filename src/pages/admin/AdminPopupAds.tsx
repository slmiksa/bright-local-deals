import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, X, Check, Upload, MonitorSmartphone, ExternalLink, Link2 } from "lucide-react";

interface PopupAd {
  id: string;
  image_url: string;
  city: string;
  link_url: string | null;
  link_type: string;
  active: boolean;
  created_at: string;
}

const AdminPopupAds = () => {
  const [items, setItems] = useState<PopupAd[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ city: "", link_url: "", link_type: "internal", active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("popup_ads")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as PopupAd[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    supabase.from("cities").select("name").order("sort_order").then(({ data }) => {
      setCities((data || []).map(c => c.name));
    });
  }, [fetchItems]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.city || !imageFile) {
      toast({ title: "خطأ", description: "يرجى اختيار المدينة ورفع صورة", variant: "destructive" });
      return;
    }

    setSaving(true);

    // Upload image
    const ext = imageFile.name.split('.').pop();
    const path = `popup/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, imageFile);
    if (uploadError) {
      toast({ title: "خطأ في رفع الصورة", description: uploadError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);

    const { error } = await supabase.from("popup_ads").insert({
      image_url: urlData.publicUrl,
      city: form.city,
      link_url: form.link_url.trim() || null,
      link_type: form.link_type,
      active: form.active,
    });

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم إضافة الإعلان المنبثق" });
      setShowForm(false);
      setForm({ city: "", link_url: "", link_type: "internal", active: true });
      setImageFile(null);
      setImagePreview(null);
      fetchItems();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("popup_ads").update({ active: !current }).eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان المنبثق؟")) return;
    const { error } = await supabase.from("popup_ads").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الإعلان المنبثق" });
      fetchItems();
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <MonitorSmartphone className="w-5 h-5" /> الإعلانات المنبثقة
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> إضافة إعلان منبثق
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground mb-2">إعلان منبثق جديد</h2>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">صورة الإعلان *</label>
            {imagePreview ? (
              <div className="relative w-full max-w-[300px] mx-auto rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="preview" className="w-full object-contain" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-foreground/60 text-primary-foreground flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-background cursor-pointer transition-colors">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">اضغط لاختيار صورة</span>
              </label>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">المدينة *</label>
            <select
              value={form.city}
              onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
              className={`${inputClass} appearance-none`}
            >
              <option value="">اختر المدينة</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Link Type */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">نوع الرابط</label>
            <div className="flex gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, link_type: "internal" }))}
                className={`flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                  form.link_type === "internal" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
                }`}
              >
                <Link2 className="w-4 h-4" /> داخلي
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, link_type: "external" }))}
                className={`flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                  form.link_type === "external" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
                }`}
              >
                <ExternalLink className="w-4 h-4" /> خارجي
              </button>
            </div>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              {form.link_type === "internal" ? "رابط الإعلان الداخلي (مثال: /ad/5)" : "الرابط الخارجي (مثال: https://example.com)"}
            </label>
            <input
              value={form.link_url}
              onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))}
              placeholder={form.link_type === "internal" ? "/ad/5" : "https://example.com"}
              className={inputClass}
              dir="ltr"
            />
            <p className="text-[11px] text-muted-foreground mt-1">اتركه فارغاً إذا لا يوجد رابط</p>
          </div>

          {/* Active Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-primary"
            />
            <span className="text-sm text-foreground">مفعّل</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <Check className="w-4 h-4" />}
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button
              onClick={() => { setShowForm(false); setImageFile(null); setImagePreview(null); }}
              className="h-9 px-4 bg-muted text-muted-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" /> إلغاء
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">لا توجد إعلانات منبثقة</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              <img src={item.image_url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{item.city}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${item.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.active ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                {item.link_url && (
                  <p className="text-xs text-muted-foreground truncate" dir="ltr">
                    {item.link_type === "external" ? <ExternalLink className="w-3 h-3 inline mr-1" /> : <Link2 className="w-3 h-3 inline mr-1" />}
                    {item.link_url}
                  </p>
                )}
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => toggleActive(item.id, item.active)}
                    className={`h-7 px-3 rounded-lg text-xs font-bold transition-colors ${item.active ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                  >
                    {item.active ? "تعطيل" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="h-7 px-3 rounded-lg text-xs font-bold bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPopupAds;
