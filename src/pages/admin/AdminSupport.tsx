import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Headphones, Plus, Trash2, GripVertical, Check, Pencil, X, MessageCircle, Phone, Mail } from "lucide-react";

type SupportContact = {
  id: string;
  title: string;
  description: string;
  contact_type: string;
  contact_value: string;
  icon_color: string;
  sort_order: number;
  active: boolean;
};

const contactTypeOptions = [
  { value: "whatsapp", label: "واتساب", icon: MessageCircle },
  { value: "phone", label: "اتصال", icon: Phone },
  { value: "email", label: "بريد إلكتروني", icon: Mail },
];

const colorOptions = [
  { value: "bg-green-500/10 text-green-600", label: "أخضر" },
  { value: "bg-blue-500/10 text-blue-600", label: "أزرق" },
  { value: "bg-orange-500/10 text-orange-600", label: "برتقالي" },
  { value: "bg-red-500/10 text-red-600", label: "أحمر" },
  { value: "bg-purple-500/10 text-purple-600", label: "بنفسجي" },
  { value: "bg-yellow-500/10 text-yellow-600", label: "أصفر" },
  { value: "bg-pink-500/10 text-pink-600", label: "وردي" },
];

const AdminSupport = () => {
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", contact_type: "whatsapp", contact_value: "", icon_color: "bg-green-500/10 text-green-600" });

  const fetchContacts = async () => {
    const { data } = await supabase.from("support_contacts").select("*").order("sort_order");
    if (data) setContacts(data as SupportContact[]);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.contact_value.trim()) {
      toast({ title: "خطأ", description: "يرجى تعبئة جميع الحقول", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("support_contacts").insert({
      ...form,
      sort_order: contacts.length + 1,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تمت إضافة وسيلة التواصل" });
      setForm({ title: "", description: "", contact_type: "whatsapp", contact_value: "", icon_color: "bg-green-500/10 text-green-600" });
      setShowAdd(false);
      fetchContacts();
    }
  };

  const handleUpdate = async (contact: SupportContact) => {
    const { error } = await supabase.from("support_contacts").update({
      title: contact.title,
      description: contact.description,
      contact_type: contact.contact_type,
      contact_value: contact.contact_value,
      icon_color: contact.icon_color,
      active: contact.active,
    }).eq("id", contact.id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم التحديث بنجاح" });
      setEditingId(null);
      fetchContacts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("support_contacts").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم الحذف" });
      fetchContacts();
    }
  };

  const toggleActive = async (contact: SupportContact) => {
    await supabase.from("support_contacts").update({ active: !contact.active }).eq("id", contact.id);
    fetchContacts();
  };

  const getIcon = (type: string) => {
    const opt = contactTypeOptions.find(o => o.value === type);
    return opt ? opt.icon : MessageCircle;
  };

  if (loading) return <div className="flex justify-center py-10"><span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <Headphones className="w-5 h-5" /> إدارة أزرار التواصل
        </h1>
        <button onClick={() => setShowAdd(!showAdd)} className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground">إضافة وسيلة تواصل جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="العنوان (مثل: واتساب)" className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="الوصف (مثل: تواصل معنا عبر الواتساب)" className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <select value={form.contact_type} onChange={e => setForm({...form, contact_type: e.target.value})} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30">
              {contactTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input value={form.contact_value} onChange={e => setForm({...form, contact_value: e.target.value})} placeholder="القيمة (رقم/بريد)" className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" dir="ltr" />
            <select value={form.icon_color} onChange={e => setForm({...form, icon_color: e.target.value})} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30">
              {colorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
              <Check className="w-4 h-4" /> حفظ
            </button>
            <button onClick={() => setShowAdd(false)} className="h-9 px-5 bg-muted text-foreground rounded-xl text-sm font-bold active:scale-95 transition-transform">إلغاء</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map(contact => {
          const Icon = getIcon(contact.contact_type);
          const isEditing = editingId === contact.id;

          return (
            <div key={contact.id} className={`bg-card border rounded-2xl p-4 transition-all ${contact.active ? 'border-border' : 'border-border opacity-50'}`}>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={contact.title} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? {...c, title: e.target.value} : c))} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input value={contact.description} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? {...c, description: e.target.value} : c))} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <select value={contact.contact_type} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? {...c, contact_type: e.target.value} : c))} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {contactTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input value={contact.contact_value} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? {...c, contact_value: e.target.value} : c))} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" dir="ltr" />
                    <select value={contact.icon_color} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? {...c, icon_color: e.target.value} : c))} className="h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {colorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(contact)} className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform">
                      <Check className="w-3.5 h-3.5" /> حفظ
                    </button>
                    <button onClick={() => { setEditingId(null); fetchContacts(); }} className="h-8 px-4 bg-muted text-foreground rounded-lg text-xs font-bold active:scale-95 transition-transform">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${contact.icon_color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{contact.title}</p>
                    <p className="text-xs text-muted-foreground">{contact.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{contact.contact_value}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toggleActive(contact)} className={`h-7 px-2.5 rounded-lg text-[11px] font-bold ${contact.active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {contact.active ? "فعال" : "معطل"}
                    </button>
                    <button onClick={() => setEditingId(contact.id)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80">
                      <Pencil className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {contacts.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">لا توجد وسائل تواصل. أضف واحدة جديدة.</p>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
