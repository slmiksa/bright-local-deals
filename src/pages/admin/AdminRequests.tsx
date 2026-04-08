import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "قيد المراجعة", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  approved: { label: "مقبول", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
  deleted: { label: "محذوف", color: "text-gray-500 bg-gray-50 border-gray-200", icon: Trash2 },
};

const tabConfig = [
  { value: "pending", label: "قيد المراجعة", icon: Clock },
  { value: "approved", label: "مقبولة", icon: CheckCircle },
  { value: "rejected", label: "مرفوضة", icon: XCircle },
  { value: "deleted", label: "محذوفة", icon: Trash2 },
];

const AdminRequests = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmAction, setConfirmAction] = useState<{ type: "reject" | "delete"; id: string; orderNum: number } | null>(null);

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
      const { error } = await supabase.from("ad_requests").update({ status: "deleted" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-requests"] });
      toast({ title: "تم نقل الطلب إلى المحذوفة" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("ad_requests").update({ status }).eq("id", id);
      if (error) throw error;

      if (status === "approved") {
        const req = requests.find((r) => r.id === id);
        if (req?.email) {
          supabase.functions.invoke("send-acceptance-notification", {
            body: {
              orderNumber: req.order_number,
              storeName: req.store_name,
              city: req.city,
              adType: req.ad_type,
              adTier: req.ad_tier,
              totalPrice: req.total_price,
              phone: req.phone || "",
              customerEmail: req.email,
            },
          }).catch(console.error);
        }
      }
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

  const grouped = {
    pending: requests.filter((r) => r.status === "pending"),
    approved: requests.filter((r) => r.status === "approved"),
    rejected: requests.filter((r) => r.status === "rejected"),
    deleted: requests.filter((r) => r.status === "deleted"),
  };

  const renderRequestCard = (req: (typeof requests)[0]) => {
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
                onClick={() => setConfirmAction({ type: "reject", id: req.id, orderNum: req.order_number })}
                className="flex items-center justify-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl py-2 px-3 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> رفض
              </button>
            </>
          )}

          <button
            onClick={() => setConfirmAction({ type: "delete", id: req.id, orderNum: req.order_number })}
            className="flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-xl py-2 px-2.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">طلبات الإعلانات</h1>
        <span className="text-sm text-muted-foreground">{requests.length} طلب</span>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 rounded-xl p-1 h-auto">
          {tabConfig.map((tab) => {
            const count = grouped[tab.value as keyof typeof grouped]?.length || 0;
            const TabIcon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-[12px] font-bold py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabConfig.map((tab) => {
          const items = grouped[tab.value as keyof typeof grouped] || [];
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                  لا توجد طلبات {tab.label}
                </div>
              ) : (
                items.map(renderRequestCard)
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent dir="rtl" className="max-w-[340px] rounded-2xl p-6">
          <AlertDialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center bg-destructive/10">
              {confirmAction?.type === "delete" ? (
                <Trash2 className="w-7 h-7 text-destructive" />
              ) : (
                <XCircle className="w-7 h-7 text-destructive" />
              )}
            </div>
            <AlertDialogTitle className="text-[17px]">
              {confirmAction?.type === "delete" ? "تأكيد الحذف" : "تأكيد الرفض"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              {confirmAction?.type === "delete"
                ? `هل أنت متأكد من حذف الطلب #${confirmAction?.orderNum}؟ لا يمكن التراجع عن هذا الإجراء.`
                : `هل أنت متأكد من رفض الطلب #${confirmAction?.orderNum}؟`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <AlertDialogAction
              className="w-full rounded-xl py-3 text-[14px] font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "delete") {
                  deleteMutation.mutate(confirmAction.id);
                } else {
                  updateStatus.mutate({ id: confirmAction.id, status: "rejected" });
                }
                setConfirmAction(null);
              }}
            >
              نعم، {confirmAction?.type === "delete" ? "احذف" : "ارفض"}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-xl py-3 text-[14px] font-bold mt-0">
              لا، إلغاء
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRequests;
