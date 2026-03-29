import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Handshake, Plus, Trash2, Check, Pencil, X, Upload } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  sort_order: number;
  active: boolean;
};

const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", logo_url: "" });
  const [uploading, setUploading] = useState(false);

  const fetchPartners = async () => {
    const { data } = await supabase.from("success_partners").select("*").order("sort_order");
    if (data) setPartners(data as Partner[]);
    setLoading(false);
  };

  useEffect(() => { fetchPartners(); }, []);

  const uploadLogo = async (file: File): Promise<string | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `partners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ad-images").upload(path, file);
    setUploading(false);
    if (error) {
      toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "add" | string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadLogo(file);
    if (!url) return;
    if (target === "add") {
      setForm(f => ({ ...f, logo_url: url }));
    } else {
      setPartners(ps => ps.map(p => p.id === target ? { ...p, logo_url: url } : p));
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.logo_url.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم ورفع الصورة", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("success_partners").insert({
      name: form.name,
      description: form.description,
      logo_url: form.logo_url,
      sort_order: partners.length + 1,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تمت إضافة الشريك" });
      setForm({ name: "", description: "", logo_url: "" });
      setShowAdd(false);
      fetchPartners();
    }
  };

  const handleUpdate = async (partner: Partner) => {
    const { error } = await supabase.from("success_partners").update({
      name: partner.name,
      description: partner.description,
      logo_url: partner.logo_url,
      active: partner.active,
    }).eq("id", partner.id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم التحديث" });
      setEditingId(null);
      fetchPartners();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("success_partners").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم الحذف" });
      fetchPartners();
    }
  };

  const toggleActive = async (partner: Partner) => {
    await supabase.from("success_partners").update({ active: !partner.active }).eq("id", partner.id);
    fetchPartners();
  };

  if (loading) return <div className="flex justify-center py-10"><span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" /></div>;

  const inputClass = "h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30";
  const textareaClass = "px-3 py-2 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px]";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <Handshake className="w-5 h-5" /> شركاء النجاح
        </h1>
        <button onClick={() => setShowAdd(!showAdd)} className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground">إضافة شريك جديد</h3>
          <div className="space-y-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم الجهة أو الشخص" className={inputClass + " w-full"} />
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="نبذة عن الشريك (يمكنك الضغط Enter لسطر جديد)"
              className={textareaClass + " w-full"}
              rows={3}
            />
            <div className="flex items-center gap-2">
              <label className="h-10 px-4 bg-muted rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-muted/80 transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? "جاري الرفع..." : "رفع الصورة"}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, "add")} disabled={uploading} />
              </label>
              {form.logo_url && <img src={form.logo_url} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-border" />}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
              <Check className="w-4 h-4" /> حفظ
            </button>
            <button onClick={() => { setShowAdd(false); setForm({ name: "", description: "", logo_url: "" }); }} className="h-9 px-5 bg-muted text-foreground rounded-xl text-sm font-bold active:scale-95 transition-transform">إلغاء</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {partners.map(partner => {
          const isEditing = editingId === partner.id;
          return (
            <div key={partner.id} className={`bg-card border rounded-2xl p-4 transition-all ${partner.active ? 'border-border' : 'border-border opacity-50'}`}>
              {isEditing ? (
                <div className="space-y-3">
                  <input value={partner.name} onChange={e => setPartners(ps => ps.map(p => p.id === partner.id ? { ...p, name: e.target.value } : p))} placeholder="اسم الجهة أو الشخص" className={inputClass + " w-full"} />
                  <textarea
                    value={partner.description || ""}
                    onChange={e => setPartners(ps => ps.map(p => p.id === partner.id ? { ...p, description: e.target.value } : p))}
                    placeholder="نبذة عن الشريك (يمكنك الضغط Enter لسطر جديد)"
                    className={textareaClass + " w-full"}
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <label className="h-10 px-4 bg-muted rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:bg-muted/80 transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? "جاري الرفع..." : "تغيير الصورة"}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, partner.id)} disabled={uploading} />
                    </label>
                    {partner.logo_url && <img src={partner.logo_url} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-border" />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(partner)} className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform">
                      <Check className="w-3.5 h-3.5" /> حفظ
                    </button>
                    <button onClick={() => { setEditingId(null); fetchPartners(); }} className="h-8 px-4 bg-muted text-foreground rounded-lg text-xs font-bold active:scale-95 transition-transform">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{partner.name}</p>
                    {partner.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 whitespace-pre-line">{partner.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toggleActive(partner)} className={`h-7 px-2.5 rounded-lg text-[11px] font-bold ${partner.active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {partner.active ? "فعال" : "معطل"}
                    </button>
                    <button onClick={() => setEditingId(partner.id)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80">
                      <Pencil className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <button onClick={() => handleDelete(partner.id)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {partners.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">لا يوجد شركاء. أضف شريكاً جديداً.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPartners;
