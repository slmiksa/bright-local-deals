import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gift, Trophy, Users, Trash2, Shuffle, Plus, Upload } from "lucide-react";

const AdminGiveaways = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", prize: "", end_date: "", snapchat_url: "",
    sponsor_name: "", sponsor_logo_url: "", sponsor_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showEntries, setShowEntries] = useState<string | null>(null);
  const [winnerInput, setWinnerInput] = useState("");

  const { data: giveaways = [] } = useQuery({
    queryKey: ["admin_giveaways"],
    queryFn: async () => {
      const { data } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["giveaway_entries", showEntries],
    queryFn: async () => {
      if (!showEntries) return [];
      const { data } = await supabase
        .from("giveaway_entries")
        .select("*")
        .eq("giveaway_id", showEntries)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!showEntries,
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `sponsors/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("giveaway-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("giveaway-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let logoUrl = form.sponsor_logo_url;
      if (logoFile) logoUrl = await uploadLogo(logoFile);

      const payload = {
        title: form.title,
        prize: form.prize,
        end_date: new Date(form.end_date).toISOString(),
        snapchat_url: form.snapchat_url,
        sponsor_name: form.sponsor_name || null,
        sponsor_logo_url: logoUrl || null,
        sponsor_url: form.sponsor_url || null,
      };

      if (editId) {
        const { error } = await supabase.from("giveaways").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("giveaways").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_giveaways"] });
      toast({ title: editId ? "تم التحديث" : "تم الإنشاء" });
      resetForm();
    },
    onError: (err: any) => toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("giveaways").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_giveaways"] });
      queryClient.invalidateQueries({ queryKey: ["active_giveaway"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("giveaways").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_giveaways"] });
      toast({ title: "تم الحذف" });
    },
  });

  const setWinnerMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("giveaways").update({ winner_name: name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_giveaways"] });
      queryClient.invalidateQueries({ queryKey: ["active_giveaway"] });
      toast({ title: "تم إعلان الفائز! 🏆" });
      setWinnerInput("");
    },
  });

  const randomWinner = (giveawayId: string) => {
    if (entries.length === 0) {
      toast({ title: "لا يوجد مشاركين", variant: "destructive" });
      return;
    }
    const winner = entries[Math.floor(Math.random() * entries.length)];
    setWinnerMutation.mutate({ id: giveawayId, name: winner.name });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ title: "", prize: "", end_date: "", snapchat_url: "", sponsor_name: "", sponsor_logo_url: "", sponsor_url: "" });
    setLogoFile(null);
  };

  const startEdit = (g: any) => {
    setEditId(g.id);
    setForm({
      title: g.title, prize: g.prize,
      end_date: new Date(g.end_date).toISOString().slice(0, 16),
      snapchat_url: g.snapchat_url || "",
      sponsor_name: g.sponsor_name || "",
      sponsor_logo_url: g.sponsor_logo_url || "",
      sponsor_url: g.sponsor_url || "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" /> السحوبات
        </h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> سحب جديد
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">{editId ? "تعديل السحب" : "سحب جديد"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>عنوان السحب</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: سحب شهر رمضان" />
              </div>
              <div className="space-y-1.5">
                <Label>الجائزة</Label>
                <Input value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} placeholder="مثال: 200 ريال" />
              </div>
              <div className="space-y-1.5">
                <Label>تاريخ ووقت السحب</Label>
                <Input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>رابط سناب شات</Label>
                <Input value={form.snapchat_url} onChange={e => setForm(f => ({ ...f, snapchat_url: e.target.value }))} placeholder="https://snapchat.com/..." dir="ltr" />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-bold text-muted-foreground">الراعي (اختياري)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>اسم الراعي</Label>
                  <Input value={form.sponsor_name} onChange={e => setForm(f => ({ ...f, sponsor_name: e.target.value }))} placeholder="مثال: كوفي لمحة" />
                </div>
                <div className="space-y-1.5">
                  <Label>رابط الراعي</Label>
                  <Input value={form.sponsor_url} onChange={e => setForm(f => ({ ...f, sponsor_url: e.target.value }))} placeholder="https://..." dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>لوقو الراعي</Label>
                  <div className="flex items-center gap-2">
                    {(form.sponsor_logo_url || logoFile) && (
                      <img src={logoFile ? URL.createObjectURL(logoFile) : form.sponsor_logo_url} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <label className="cursor-pointer flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Upload className="w-4 h-4" />
                      {logoFile ? logoFile.name : "رفع صورة"}
                      <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title || !form.prize || !form.end_date}>
                {saveMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
              <Button variant="outline" onClick={resetForm}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Giveaways list */}
      <div className="space-y-4">
        {giveaways.map((g: any) => (
          <Card key={g.id} className={g.active ? "border-primary/50" : ""}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm">{g.title}</h3>
                    {g.winner_name && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">فائز</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">الجائزة: {g.prize}</p>
                  <p className="text-xs text-muted-foreground">
                    الموعد: {new Date(g.end_date).toLocaleString("ar-SA")}
                  </p>
                  {g.sponsor_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {g.sponsor_logo_url && <img src={g.sponsor_logo_url} className="w-4 h-4 rounded-full" />}
                      برعاية: {g.sponsor_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={g.active}
                    onCheckedChange={(active) => toggleActive.mutate({ id: g.id, active })}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(g)}>✏️</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(g.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs"
                  onClick={() => setShowEntries(showEntries === g.id ? null : g.id)}>
                  <Users className="w-3.5 h-3.5" />
                  المشاركين
                </Button>
                {!g.winner_name && (
                  <>
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="اسم الفائز"
                        className="h-8 text-xs w-32"
                        value={showEntries === g.id ? winnerInput : ""}
                        onChange={e => { setShowEntries(g.id); setWinnerInput(e.target.value); }}
                      />
                      <Button size="sm" className="h-8 text-xs gap-1" disabled={!winnerInput}
                        onClick={() => setWinnerMutation.mutate({ id: g.id, name: winnerInput })}>
                        <Trophy className="w-3.5 h-3.5" /> إعلان
                      </Button>
                    </div>
                    <Button variant="secondary" size="sm" className="h-8 text-xs gap-1"
                      onClick={() => { setShowEntries(g.id); setTimeout(() => randomWinner(g.id), 500); }}>
                      <Shuffle className="w-3.5 h-3.5" /> سحب عشوائي
                    </Button>
                  </>
                )}
                {g.winner_name && (
                  <span className="text-sm flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500" /> {g.winner_name}
                  </span>
                )}
              </div>

              {/* Entries list */}
              {showEntries === g.id && entries.length > 0 && (
                <div className="border rounded-lg overflow-hidden mt-2">
                  <div className="bg-muted px-3 py-1.5 text-xs font-bold flex justify-between">
                    <span>المشاركين ({entries.length})</span>
                  </div>
                  <div className="max-h-60 overflow-auto divide-y">
                    {entries.map((e: any) => (
                      <div key={e.id} className="px-3 py-2 text-xs flex justify-between">
                        <span className="font-medium">{e.name}</span>
                        <span className="text-muted-foreground" dir="ltr">{e.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showEntries === g.id && entries.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">لا يوجد مشاركين بعد</p>
              )}
            </CardContent>
          </Card>
        ))}

        {giveaways.length === 0 && !showForm && (
          <div className="text-center py-12 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد سحوبات</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGiveaways;
