import { Camera, Plus } from "lucide-react";

const AddAdPage = () => {
  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-3.5">
          <h1 className="text-lg font-bold text-foreground">إضافة إعلان</h1>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-5">
        {/* Image Upload */}
        <button className="touch-target w-full aspect-[16/9] bg-card rounded-2xl shadow-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 active:bg-secondary transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Camera className="w-7 h-7 text-muted-foreground" />
          </div>
          <span className="text-[13px] text-muted-foreground font-medium">اضغط لإضافة صور</span>
        </button>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">اسم المتجر / النشاط</label>
            <input
              type="text"
              placeholder="مثال: كافيه الديوان"
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">القسم</label>
            <select className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">اختر القسم</option>
              <option value="electronics">إلكترونيات</option>
              <option value="cafes">كافيهات</option>
              <option value="perfumes">عطور وروائح</option>
              <option value="furniture">مفروشات</option>
              <option value="food">مأكولات</option>
              <option value="events">مناسبات</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">العرض أو الوصف المختصر</label>
            <input
              type="text"
              placeholder="مثال: خصم 20% على جميع المنتجات"
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">رقم التواصل</label>
            <input
              type="tel"
              placeholder="05XXXXXXXX"
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5">الوصف التفصيلي</label>
            <textarea
              placeholder="اكتب وصفاً تفصيلياً عن نشاطك..."
              rows={4}
              className="w-full bg-card rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button className="touch-target w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-[15px] active:scale-[0.97] transition-transform shadow-elevated">
          <Plus className="w-5 h-5" />
          نشر الإعلان
        </button>

        <p className="text-center text-muted-foreground text-[11px] pb-4">
          سيتم مراجعة إعلانك قبل النشر
        </p>
      </div>
    </div>
  );
};

export default AddAdPage;
