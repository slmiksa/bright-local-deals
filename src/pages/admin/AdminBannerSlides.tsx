import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, X, Check, Upload, Image, ExternalLink, Link2, Pencil, Ban } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BannerSlide {
  id: string;
  image_url: string;
  city: string;
  link_url: string | null;
  link_type: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

const AdminBannerSlides = () => {
  const [items, setItems] = useState<BannerSlide[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ city: "", link_url: "", link_type: "none", active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("banner_slides")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    setItems((data as BannerSlide[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    supabase.from("cities").select("name").order("sort_order").then(({ data }) => {
      setCities((data || []).map(c => c.name));
    });
  }, [fetchItems]);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ city: "", link_url: "", link_type: "none", active: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: BannerSlide) => {
    setEditId(item.id);
    setForm({
      city: item.city,
      link_url: item.link_url || "",
      link_type: item.link_type,
      active: item.active,
    });
    setImageFile(null);
    setImagePreview(item.image_url);
    setShowForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!editId && !imageFile) {
      toast({ title: "خطأ", description: "يرجى رفع صورة", variant: "destructive" });
      return;
    }
    if (!form.city) {
      toast({ title: "خطأ", description: "يرجى اختيار المدينة أو الجميع", variant: "destructive" });
      return;
    }

    setSaving(true);

    let imageUrl: string | undefined;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, imageFile);
      if (uploadError) {
        toast({ title: "خطأ في رفع الصورة", description: uploadError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const payload: {
      city: string; link_url: string | null; link_type: string; active: boolean; image_url?: string;
    } = {
      city: form.city,
      link_url: form.link_url.trim() || null,
      link_type: form.link_type,
      active: form.active,
    };
    if (imageUrl) payload.image_url = imageUrl;

    if (editId) {
      const { error } = await supabase.from("banner_slides").update(payload).eq("id", editId);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم", description: "تم تحديث السلايد" });
        resetForm();
        fetchItems();
      }
    } else {
      if (!imageUrl) { setSaving(false); return; }
      const insertPayload = { ...payload, image_url: imageUrl };
      const { error } = await supabase.from("banner_slides").insert(insertPayload);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم", description: "تم إضافة السلايد" });
        resetForm();
        fetchItems();
      }
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("banner_slides").update({ active: !current }).eq("id", id);
    if (!error) fetchItems();
    else toast({ title: "خطأ", description: error.message, variant: "destructive" });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("banner_slides").delete().eq("id", deleteId);
    if (!error) { toast({ title: "تم", description: "تم الحذف" }); fetchItems(); }
    else toast({ title: "خطأ", description: error.message, variant: "destructive" });
    setDeleteId(null);
  };

  const inputClass = "w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <Image className="w-5 h-5" /> السلايد الإعلاني
        </h1>
        {!showForm && (
          <button onClick={openNewForm} className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
            <Plus className="w-4 h-4" /> إضافة سلايد
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground mb-2">{editId ? "تعديل السلايد" : "سلايد جديد"}</h2>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">الصورة {editId ? "(اختياري - اتركها لعدم التغيير)" : "*"}</label>
            {imagePreview ? (
              <div className="relative w-full max-w-[400px] mx-auto rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="preview" className="w-full object-contain" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(editId ? items.find(i => i.id === editId)?.image_url || null : null); }}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-foreground/60 text-primary-foreground flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-background cursor-pointer transition-colors">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">اضغط لاختيار صورة</span>
                <span className="text-[11px] text-muted-foreground/60">المقاس المُوصى به: 800×400 بكسل (نسبة 2:1)</span>
              </label>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">المدينة *</label>
            <select value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} className={`${inputClass} appearance-none`}>
              <option value="">اختر المدينة</option>
              <option value="all">جميع المدن</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Link Type */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">نوع الرابط</label>
            <div className="flex gap-2">
              {[
                { value: "none", label: "بدون رابط", icon: Ban },
                { value: "internal", label: "داخلي", icon: Link2 },
                { value: "external", label: "خارجي", icon: ExternalLink },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, link_type: opt.value, link_url: opt.value === "none" ? "" : f.link_url }))}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                    form.link_type === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link URL */}
          {form.link_type !== "none" && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {form.link_type === "internal" ? "الرابط الداخلي (مثال: /ad/5)" : "الرابط الخارجي (مثال: https://example.com)"}
              </label>
              <input value={form.link_url} onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder={form.link_type === "internal" ? "/ad/5" : "https://example.com"} className={inputClass} dir="ltr" />
            </div>
          )}

          {/* Active Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground">مفعّل</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50">
              {saving ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <Check className="w-4 h-4" />}
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={resetForm} className="h-9 px-4 bg-muted text-muted-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
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
        <div className="text-center py-16 text-muted-foreground text-sm">لا توجد سلايدات إعلانية</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              <img src={item.image_url} alt="" className="w-24 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{item.city === "all" ? "جميع المدن" : item.city}</span>
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
                {item.link_type === "none" && (
                  <p className="text-xs text-muted-foreground">بدون رابط</p>
                )}
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => openEditForm(item)} className="h-7 px-3 rounded-lg text-xs font-bold bg-primary/10 text-primary flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> تعديل
                  </button>
                  <button onClick={() => toggleActive(item.id, item.active)} className={`h-7 px-3 rounded-lg text-xs font-bold transition-colors ${item.active ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {item.active ? "تعطيل" : "تفعيل"}
                  </button>
                  <button onClick={() => setDeleteId(item.id)} className="h-7 px-3 rounded-lg text-xs font-bold bg-destructive/10 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-base font-bold">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-sm">هل أنت متأكد من حذف هذا السلايد؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">حذف</AlertDialogAction>
            <AlertDialogCancel className="rounded-xl font-bold">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBannerSlides;
