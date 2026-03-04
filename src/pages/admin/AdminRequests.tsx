import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "قيد المراجعة", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  approved: { label: "مقبول", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
};

const AdminRequests = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-ad-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-requests"] });
      toast({ title: "تم حذف الطلب" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("ad_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-requests"] });
      toast({ title: "تم تحديث الحالة" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">طلبات الإعلانات</h1>
        <span className="text-sm text-muted-foreground">{requests.length} طلب</span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
          لا توجد طلبات حالياً
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const st = statusMap[req.status] || statusMap.pending;
            const StatusIcon = st.icon;
            return (
              <div key={req.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-primary">#{req.order_number}</span>
                    <span className="text-[14px] font-bold text-foreground">{req.store_name}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {st.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-muted-foreground">النوع: </span>
                    <span className="font-bold text-foreground">{req.ad_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الفئة: </span>
                    <span className="font-bold text-foreground">{req.ad_tier}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المدينة: </span>
                    <span className="font-bold text-foreground">{req.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">السعر: </span>
                    <span className="font-bold text-primary">{req.total_price} ريال</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => navigate(`/admin/requests/${req.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl py-2 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> استعراض
                  </button>

                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus.mutate({ id: req.id, status: "approved" })}
                        className="flex items-center justify-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl py-2 px-3 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> قبول
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: req.id, status: "rejected" })}
                        className="flex items-center justify-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl py-2 px-3 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> رفض
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) deleteMutation.mutate(req.id); }}
                    className="flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-xl py-2 px-2.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
