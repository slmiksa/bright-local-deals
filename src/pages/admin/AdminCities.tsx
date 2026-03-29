import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Check, Star, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Region {
  id: string;
  name: string;
  sort_order: number | null;
  is_default: boolean;
}

interface City {
  id: string;
  name: string;
  sort_order: number | null;
  region_id: string | null;
  is_default: boolean;
}

const AdminCities = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Region form
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editRegionId, setEditRegionId] = useState<string | null>(null);
  const [regionForm, setRegionForm] = useState({ name: "", sort_order: "0" });

  // City form
  const [showCityForm, setShowCityForm] = useState(false);
  const [editCityId, setEditCityId] = useState<string | null>(null);
  const [cityForm, setCityForm] = useState({ name: "", sort_order: "0", region_id: "" });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ type: "region" | "city"; id: string; name: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [regRes, citRes] = await Promise.all([
      supabase.from("regions").select("*").order("sort_order"),
      supabase.from("cities").select("*").order("sort_order"),
    ]);
    setRegions(regRes.data || []);
    setCities(citRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Region CRUD ---
  const openNewRegion = () => {
    setEditRegionId(null);
    setRegionForm({ name: "", sort_order: "0" });
    setShowRegionForm(true);
  };
  const openEditRegion = (r: Region) => {
    setEditRegionId(r.id);
    setRegionForm({ name: r.name, sort_order: String(r.sort_order || 0) });
    setShowRegionForm(true);
  };
  const saveRegion = async () => {
    if (!regionForm.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المنطقة", variant: "destructive" });
      return;
    }
    const data = { name: regionForm.name.trim(), sort_order: parseInt(regionForm.sort_order) || 0 };
    if (editRegionId) {
      const { error } = await supabase.from("regions").update(data).eq("id", editRegionId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("regions").insert(data);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "تم", description: editRegionId ? "تم التحديث" : "تم الإضافة" });
    setShowRegionForm(false);
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    const { type, id } = deleteDialog;
    if (type === "region") {
      const { error } = await supabase.from("regions").delete().eq("id", id);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); }
      else { toast({ title: "تم", description: "تم حذف المنطقة" }); }
    } else {
      const { error } = await supabase.from("cities").delete().eq("id", id);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); }
      else { toast({ title: "تم", description: "تم حذف المدينة" }); }
    }
    setDeleteDialog(null);
    fetchData();
  };

  const toggleDefaultRegion = async (region: Region) => {
    if (region.is_default) {
      // Unset default
      await supabase.from("regions").update({ is_default: false }).eq("id", region.id);
      toast({ title: "تم", description: "تم إلغاء الافتراضي" });
    } else {
      // Clear all defaults, then set this one
      await supabase.from("regions").update({ is_default: false }).neq("id", "");
      await supabase.from("cities").update({ is_default: false }).neq("id", "");
      await supabase.from("regions").update({ is_default: true }).eq("id", region.id);
      toast({ title: "تم", description: "تم تعيين المنطقة كافتراضية" });
    }
    fetchData();
  };

  // --- City CRUD ---
  const openNewCity = (regionId?: string) => {
    setEditCityId(null);
    setCityForm({ name: "", sort_order: "0", region_id: regionId || "" });
    setShowCityForm(true);
  };
  const openEditCity = (c: City) => {
    setEditCityId(c.id);
    setCityForm({ name: c.name, sort_order: String(c.sort_order || 0), region_id: c.region_id || "" });
    setShowCityForm(true);
  };
  const saveCity = async () => {
    if (!cityForm.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المدينة", variant: "destructive" });
      return;
    }
    if (!cityForm.region_id) {
      toast({ title: "خطأ", description: "يرجى اختيار المنطقة", variant: "destructive" });
      return;
    }
    const data = {
      name: cityForm.name.trim(),
      sort_order: parseInt(cityForm.sort_order) || 0,
      region_id: cityForm.region_id,
    };
    if (editCityId) {
      const { error } = await supabase.from("cities").update(data).eq("id", editCityId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("cities").insert(data);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "تم", description: editCityId ? "تم التحديث" : "تم الإضافة" });
    setShowCityForm(false);
    fetchData();
  };

  const toggleDefaultCity = async (city: City) => {
    if (city.is_default) {
      // Unset default
      await supabase.from("cities").update({ is_default: false }).eq("id", city.id);
      toast({ title: "تم", description: "تم إلغاء الافتراضي" });
    } else {
      // Clear all defaults, then set this one
      await supabase.from("regions").update({ is_default: false }).neq("id", "");
      await supabase.from("cities").update({ is_default: false }).neq("id", "");
      await supabase.from("cities").update({ is_default: true }).eq("id", city.id);
      toast({ title: "تم", description: "تم تعيين المدينة كافتراضية" });
    }
    fetchData();
  };

  const getCitiesForRegion = (regionId: string) => cities.filter(c => c.region_id === regionId);
  const unassignedCities = cities.filter(c => !c.region_id);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground">إدارة المناطق والمدن</h1>
        <div className="flex gap-2">
          <button onClick={openNewRegion} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform">
            <Plus className="w-4 h-4" /> منطقة
          </button>
          <button onClick={() => openNewCity()} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform">
            <Plus className="w-4 h-4" /> مدينة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : regions.length === 0 && cities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد مناطق أو مدن. أضف منطقة أولاً ثم أضف مدناً لها.</div>
      ) : (
        <div className="space-y-4">
          {regions.map((region) => {
            const regionCities = getCitiesForRegion(region.id);
            return (
              <div key={region.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Region header */}
                <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-[14px] font-bold text-foreground">{region.name}</span>
                    <span className="text-[11px] text-muted-foreground">({regionCities.length} مدن)</span>
                    {region.is_default && (
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-lg">افتراضي</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleDefaultRegion(region)} title={region.is_default ? "إلغاء الافتراضي" : "تعيين كافتراضي"} className={`w-7 h-7 rounded-lg flex items-center justify-center ${region.is_default ? "bg-amber-500/20 text-amber-600" : "bg-amber-500/10 text-amber-600"}`}>
                      <Star className={`w-3.5 h-3.5 ${region.is_default ? "fill-amber-500" : ""}`} />
                    </button>
                    <button onClick={() => openNewCity(region.id)} className="w-7 h-7 rounded-lg bg-accent/20 text-accent-foreground flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEditRegion(region)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteDialog({ type: "region", id: region.id, name: region.name })} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cities under region */}
                {regionCities.length === 0 ? (
                  <p className="p-3 text-[12px] text-muted-foreground text-center">لا توجد مدن - اضغط + لإضافة مدينة</p>
                ) : (
                  <div className="divide-y divide-border">
                    {regionCities.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          <span className="text-[13px] font-semibold text-foreground">{c.name}</span>
                          {c.is_default && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md">افتراضي</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleDefaultCity(c)} title={c.is_default ? "إلغاء الافتراضي" : "تعيين كافتراضي"} className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.is_default ? "bg-amber-500/20 text-amber-600" : "bg-amber-500/10 text-amber-600"}`}>
                            <Star className={`w-3 h-3 ${c.is_default ? "fill-amber-500" : ""}`} />
                          </button>
                          <button onClick={() => openEditCity(c)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDeleteDialog({ type: "city", id: c.id, name: c.name })} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unassigned cities */}
          {unassignedCities.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-3 bg-muted/30 border-b border-border">
                <span className="text-[14px] font-bold text-muted-foreground">مدن بدون منطقة</span>
              </div>
              <div className="divide-y divide-border">
                {unassignedCities.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[13px] text-foreground">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditCity(c)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => setDeleteDialog({ type: "city", id: c.id, name: c.name })} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-base font-bold">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-sm">
              {deleteDialog?.type === "region"
                ? `هل أنت متأكد من حذف منطقة "${deleteDialog?.name}"؟ ستفقد المدن المرتبطة بها ارتباطها.`
                : `هل أنت متأكد من حذف مدينة "${deleteDialog?.name}"؟`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-xl font-bold">
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Region Form Modal */}
      {showRegionForm && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editRegionId ? "تعديل منطقة" : "إضافة منطقة"}</h2>
              <button onClick={() => setShowRegionForm(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم المنطقة *</label>
                <input value={regionForm.name} onChange={(e) => setRegionForm(f => ({...f, name: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">الترتيب</label>
                <input type="number" value={regionForm.sort_order} onChange={(e) => setRegionForm(f => ({...f, sort_order: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={saveRegion} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> حفظ</button>
              <button onClick={() => setShowRegionForm(false)} className="h-10 px-4 bg-muted text-foreground rounded-xl text-sm font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* City Form Modal */}
      {showCityForm && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editCityId ? "تعديل مدينة" : "إضافة مدينة"}</h2>
              <button onClick={() => setShowCityForm(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">المنطقة *</label>
                <select value={cityForm.region_id} onChange={(e) => setCityForm(f => ({...f, region_id: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border appearance-none">
                  <option value="">اختر المنطقة</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم المدينة *</label>
                <input value={cityForm.name} onChange={(e) => setCityForm(f => ({...f, name: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">الترتيب</label>
                <input type="number" value={cityForm.sort_order} onChange={(e) => setCityForm(f => ({...f, sort_order: e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border" dir="ltr" />
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={saveCity} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> حفظ</button>
              <button onClick={() => setShowCityForm(false)} className="h-10 px-4 bg-muted text-foreground rounded-xl text-sm font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCities;
