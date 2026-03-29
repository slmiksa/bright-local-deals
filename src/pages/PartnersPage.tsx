import { ArrowRight, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Partner = {
  id: string;
  name: string;
  description: string;
  logo_url: string;
};

const PartnersPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("success_partners").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setPartners(data as Partner[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">شركاء النجاح</h1>
        </div>
      </div>

      <div className="px-5 pt-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Handshake className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[16px] font-bold text-foreground">شركاؤنا في النجاح</h2>
          <p className="text-[13px] text-muted-foreground">نفتخر بشراكتنا مع أفضل الجهات والمؤسسات</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : partners.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">لا يوجد شركاء حالياً</p>
        ) : (
          <div className="space-y-4">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="aspect-[16/9] w-full">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-right">
                  <p className="text-[14px] font-bold text-foreground">{partner.name}</p>
                  {partner.description && (
                    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{partner.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersPage;
