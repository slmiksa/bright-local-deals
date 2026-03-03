import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Save } from "lucide-react";

const AdminTerms = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("terms_policies")
        .select("content")
        .eq("id", "default")
        .single();
      if (!error && data) setContent(data.content);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("terms_policies")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", "default");

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حفظ الشروط والسياسات" });
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5" /> الشروط والسياسات
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب الشروط والسياسات هنا..."
        className="w-full min-h-[400px] p-4 rounded-2xl bg-card text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y leading-7"
        dir="rtl"
      />
    </div>
  );
};

export default AdminTerms;
