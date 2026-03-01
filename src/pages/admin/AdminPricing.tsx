import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Check, DollarSign } from "lucide-react";

interface PricingItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  sort_order: number | null;
}

const AdminPricing = () => {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration_days: "30", sort_order: "0" });

  const fetchPricing = async () => {
    const { data, error } = await supabase
      .from("ad_pricing" as any)
      .select("*")
      .order("sort_order");
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      setItems((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPricing(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", duration_days: "30", sort_order: "0" });
    setShowAdd(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast({ title: "خطأ", description: "يرجى تعبئة الاسم والسعر", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      duration_days: parseInt(form.duration_days) || 30,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editingId) {
      const { error } = await supabase.from("ad_pricing" as any).update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم", description: "تم تحديث الباقة" });
    } else {
      const { error } = await supabase.from("ad_pricing" as any).insert(payload);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم", description: "تمت إضافة الباقة" });
    }
    resetForm();
    fetchPricing();
  };

  const handleEdit = (item: PricingItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      duration_days: String(item.duration_days),
      sort_order: String(item.sort_order || 0),
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    const { error } = await supabase.from("ad_pricing" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الباقة" });
      fetchPricing();
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5" /> أسعار الإعلانات
        </h1>
        {!showAdd && (
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> إضافة باقة
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-3">
          <h2 className="text-sm font-bold text-foreground mb-2">
            {editingId ? "تعديل الباقة" : "إضافة باقة جديدة"}
          </h2>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الباقة" className={inputClass} />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الباقة (اختياري)" className={inputClass} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">السعر (ريال)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className={inputClass} dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المدة (أيام)</label>
              <input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))} placeholder="30" className={inputClass} dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الترتيب</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" className={inputClass} dir="ltr" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
              <Check className="w-4 h-4" /> حفظ
            </button>
            <button onClick={resetForm} className="h-9 px-4 bg-muted text-muted-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
              <X className="w-4 h-4" /> إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">لا توجد باقات أسعار حالياً</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="font-bold text-primary text-base">{item.price} ريال</span>
                  <span>{item.duration_days} يوم</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
