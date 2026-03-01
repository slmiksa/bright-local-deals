import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Timer, Check } from "lucide-react";

const AdminCountdown = () => {
  const [launchDate, setLaunchDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("app_settings").select("launch_date").eq("id", "default").single();
      if (data?.launch_date) {
        const d = new Date(data.launch_date);
        setLaunchDate(d.toISOString().slice(0, 16));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!launchDate) {
      toast({ title: "خطأ", description: "يرجى تحديد تاريخ التدشين", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ launch_date: new Date(launchDate).toISOString(), updated_at: new Date().toISOString() })
      .eq("id", "default");
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم تحديث تاريخ التدشين بنجاح" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
        <Timer className="w-5 h-5" /> العد التنازلي للتدشين
      </h1>

      <div className="bg-card border border-border rounded-2xl p-5 max-w-lg space-y-4">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">تاريخ ووقت التدشين</label>
          <input
            type="datetime-local"
            value={launchDate}
            onChange={e => setLaunchDate(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            dir="ltr"
          />
        </div>

        {launchDate && (
          <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground">
            التدشين: {new Date(launchDate).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> حفظ التاريخ
        </button>
      </div>
    </div>
  );
};

export default AdminCountdown;
