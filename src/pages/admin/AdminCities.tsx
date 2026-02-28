import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface City {
  id: string;
  name: string;
  sort_order: number | null;
}

const AdminCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sort_order: "0" });

  const fetchCities = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("cities").select("*").order("sort_order");
    setCities(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const openEdit = (city: City) => {
    setEditId(city.id);
    setForm({ name: city.name, sort_order: String(city.sort_order || 0) });
    setShowForm(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ name: "", sort_order: "0" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المدينة", variant: "destructive" });
      return;
    }
    const data = { name: form.name.trim(), sort_order: parseInt(form.sort_order) || 0 };

    if (editId) {
      const { error } = await supabase.from("cities").update(data).eq("id", editId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("cities").insert(data);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "تم", description: editId ? "تم التحديث" : "تم الإضافة" });
    setShowForm(false);
    fetchCities();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المدينة؟")) return;
    const { error } = await supabase.from("cities").delete().eq("id", id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم", description: "تم حذف المدينة" });
    fetchCities();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground">إدارة المدن</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> إضافة مدينة
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right p-3 font-bold text-foreground">المدينة</th>
              <th className="text-right p-3 font-bold text-foreground">الترتيب</th>
              <th className="text-right p-3 font-bold text-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : cities.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">لا توجد مدن</td></tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="p-3 font-semibold text-foreground">{city.name}</td>
                  <td className="p-3 text-muted-foreground">{city.sort_order}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(city)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(city.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editId ? "تعديل مدينة" : "إضافة مدينة"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم المدينة *</label>
                <input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">الترتيب</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({...f, sort_order: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={handleSave} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> حفظ</button>
              <button onClick={() => setShowForm(false)} className="h-10 px-4 bg-muted text-foreground rounded-xl text-sm font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCities;
