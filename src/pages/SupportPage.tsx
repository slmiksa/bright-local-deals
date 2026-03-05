import { Headphones, MessageCircle, Phone, Mail, ArrowRight, FileText, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
};

const getAction = (type: string, value: string) => {
  switch (type) {
    case "whatsapp": return () => window.open(`https://wa.me/${value}`, "_blank");
    case "phone": return () => window.open(`tel:${value}`);
    case "email": return () => window.open(`mailto:${value}`);
    default: return () => {};
  }
};

const SupportPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<SupportContact[]>([]);

  useEffect(() => {
    supabase.from("support_contacts").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setContacts(data as SupportContact[]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[430px] mx-auto">
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">الدعم الفني</h1>
        </div>
      </div>

      <div className="px-5 pt-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[16px] font-bold text-foreground">كيف نقدر نساعدك؟</h2>
          <p className="text-[13px] text-muted-foreground">تواصل معنا بأي طريقة تناسبك وسنرد عليك بأسرع وقت</p>
        </div>

        <div className="space-y-3">
          {contacts.map((contact) => {
            const Icon = iconMap[contact.contact_type] || MessageCircle;
            return (
              <button
                key={contact.id}
                onClick={getAction(contact.contact_type, contact.contact_value)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${contact.icon_color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right flex-1">
                  <p className="text-[14px] font-bold text-foreground">{contact.title}</p>
                  <p className="text-[12px] text-muted-foreground">{contact.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/privacy")}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-600">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-right flex-1">
            <p className="text-[14px] font-bold text-foreground">سياسة الخصوصية</p>
            <p className="text-[12px] text-muted-foreground">اطلع على سياسة الخصوصية</p>
          </div>
        </button>

        {/* FAQ Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="text-[15px] font-bold text-foreground">الأسئلة المتكررة</h3>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="1" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">ما هو تطبيق لمحة؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                تطبيق لمحة  هو  تجمع أفضل العروض والخصومات من مختلف المتاجر والمحلات في مدينتك، ليسهّل عليك الوصول لأحدث العروض وتوفير المال.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="2" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">كيف أقدر أضيف إعلان لمتجري؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                اضغط على زر "أضف إعلانك" في الصفحة الرئيسية، ثم عبّئ بيانات متجرك والعرض المطلوب وارفع الصور، وبعدها أرسل الطلب عبر الواتساب. سيتم مراجعة طلبك ونشره خلال وقت قصير.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="3" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">كم تكلفة الإعلان؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                تختلف الأسعار حسب نوع الإعلان ومدته. يمكنك الاطلاع على باقات الأسعار المتوفرة أثناء تعبئة نموذج الإعلان. كما يوجد خيار الإعلان المميز الذي يظهر في أعلى الصفحة مقابل رسوم إضافية.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="4" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">كم يستغرق نشر الإعلان بعد الطلب؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                عادةً يتم مراجعة الطلب ونشر الإعلان خلال ٢٤ ساعة كحد أقصى من تأكيد الدفع. في بعض الحالات قد يتم النشر خلال ساعات قليلة.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="5" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">هل أقدر أعدّل إعلاني بعد النشر؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                نعم، يمكنك التواصل معنا عبر الواتساب وإرسال رقم الطلب مع التعديلات المطلوبة وسنقوم بتحديث الإعلان في أقرب وقت.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="6" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">كيف أغيّر المدينة لعرض عروض مدينتي؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                من الصفحة الرئيسية، اضغط على اسم المدينة في الأعلى واختر مدينتك من القائمة. سيتم تحديث العروض تلقائياً لعرض عروض المدينة المختارة.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="7" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">هل التطبيق مجاني للمستخدمين؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                نعم، تصفح العروض والخصومات مجاني تماماً لجميع المستخدمين. الرسوم تكون فقط على أصحاب المتاجر الراغبين في نشر إعلاناتهم.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="8" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">ما هو الإعلان المميز؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                الإعلان المميز يظهر في قسم "المميز" بالصفحة الرئيسية مع سلايدر خاص، مما يمنح إعلانك ظهوراً أكبر ووصولاً أوسع للعملاء مقارنة بالإعلان العادي.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="9" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">كيف أتواصل مع صاحب العرض؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                عند فتح تفاصيل أي إعلان، ستجد زر التواصل عبر الهاتف أو الواتساب للتواصل مباشرة مع صاحب المتجر أو العرض.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="10" className="bg-card rounded-2xl border border-border px-4 [&[data-state=open]]:pb-2">
              <AccordionTrigger className="text-[13px] font-semibold text-foreground text-right hover:no-underline py-3">كيف أتابع حالة طلب إعلاني؟</AccordionTrigger>
              <AccordionContent className="text-[12px] text-muted-foreground text-right leading-relaxed">
                عند إرسال طلب الإعلان، ستحصل على رقم طلب خاص بك. يمكنك التواصل معنا عبر الواتساب وإرسال رقم الطلب للاستفسار عن حالته.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <a
          href="https://trndsky.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-muted-foreground text-[11px] pt-4 active:opacity-70 transition-opacity"
        >
          تطوير وبرمجة شركة TRNDSKY
        </a>
      </div>
    </div>
  );
};

export default SupportPage;
