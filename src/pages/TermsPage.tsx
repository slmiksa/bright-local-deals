import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";

const TermsPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("terms_policies")
        .select("content")
        .eq("id", "default")
        .single();
      if (data) setContent(data.content);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <TopBar />
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 60px)' }} />

      <div className="px-5 pt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : content ? (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="text-[14px] text-foreground leading-7 whitespace-pre-wrap">{content}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 py-16">
            <FileText className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا توجد سياسة خصوصية حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsPage;
