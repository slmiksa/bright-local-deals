import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: "", name: "", icon: "", sort_order: "0" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ id: cat.id, name: cat.name, icon: cat.icon || "", sort_order: String(cat.sort_order || 0) });
    setShowForm(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ id: "", name: "", icon: "", sort_order: "0" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id.trim() || !form.name.trim()) {
      toast({ title: "خطأ", description: "يرجى تعبئة المعرّف والاسم", variant: "destructive" });
      return;
    }
    const data = { id: form.id.trim(), name: form.name.trim(), icon: form.icon.trim() || null, sort_order: parseInt(form.sort_order) || 0 };

    if (editId) {
      const { error } = await supabase.from("categories").update({ name: data.name, icon: data.icon, sort_order: data.sort_order }).eq("id", editId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("categories").insert(data);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "تم", description: editId ? "تم التحديث" : "تم الإضافة" });
    setShowForm(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟ سيتم حذف التصنيف وقد يؤثر على الإعلانات المرتبطة.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم", description: "تم حذف التصنيف" });
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground">إدارة التصنيفات</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> إضافة تصنيف
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right p-3 font-bold text-foreground">المعرّف</th>
              <th className="text-right p-3 font-bold text-foreground">الاسم</th>
              <th className="text-right p-3 font-bold text-foreground">الأيقونة</th>
              <th className="text-right p-3 font-bold text-foreground">الترتيب</th>
              <th className="text-right p-3 font-bold text-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد تصنيفات</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="p-3 text-muted-foreground font-mono text-xs">{cat.id}</td>
                  <td className="p-3 font-semibold text-foreground">{cat.name}</td>
                  <td className="p-3 text-muted-foreground">{cat.icon || "-"}</td>
                  <td className="p-3 text-muted-foreground">{cat.sort_order}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="text-base font-bold text-foreground">{editId ? "تعديل تصنيف" : "إضافة تصنيف"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">المعرّف (بالإنجليزية) *</label>
                <input value={form.id} onChange={(e) => setForm(f => ({...f, id: e.target.value}))} disabled={!!editId} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border disabled:opacity-50" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">الاسم *</label>
                <input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">الأيقونة</label>
                <input value={form.icon} onChange={(e) => setForm(f => ({...f, icon: e.target.value}))} placeholder="Smartphone" className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
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

export default AdminCategories;
