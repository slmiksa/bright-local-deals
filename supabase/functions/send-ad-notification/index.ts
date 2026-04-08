import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRIMARY = "#3d8b6e";
const PRIMARY_DARK = "#2d6b54";
const GOLD = "#c9952b";
const BG = "#f7f5f2";
const CARD_BG = "#ffffff";
const TEXT_DARK = "#1e2a1f";
const TEXT_MUTED = "#6b7c6e";
const TEXT_LIGHT = "#94a39b";

const row = (label: string, value: string, isLast = false) => `
  <tr>
    <td style="padding:10px 12px;color:${TEXT_MUTED};font-size:13px;border-bottom:${isLast ? "none" : `1px solid rgba(61,139,110,0.08)`};">${label}</td>
    <td style="padding:10px 12px;font-weight:600;font-size:13px;text-align:left;color:${TEXT_DARK};border-bottom:${isLast ? "none" : `1px solid rgba(61,139,110,0.08)`};">${value}</td>
  </tr>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { orderNumber, adType, adTier, storeName, description, city, totalPrice, phone, customerEmail } = await req.json();

    const adminEmail = "nsaihost@gmail.com";
    const priceDisplay = totalPrice === 0 ? "مجاني" : `${totalPrice} ريال`;
    const tierDisplay = adTier === "متميز" ? `<span style="color:${GOLD};font-weight:700;">⭐ ${adTier}</span>` : (adTier || "عادي");

    // 1. Admin notification
    const adminHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Cairo,'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:${CARD_BG};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(61,139,110,0.12);">
    <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});padding:36px 24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">👓</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">لمحة للتسويق الإلكتروني</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">🔔 طلب إعلان جديد</p>
    </div>
    <div style="padding:28px 24px;">
      <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});border-radius:16px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:13px;">رقم الطلب</p>
        <p style="margin:0;color:#fff;font-size:28px;font-weight:900;">#${orderNumber}</p>
      </div>
      <div style="background:${BG};border-radius:16px;padding:4px 0;border:1px solid rgba(61,139,110,0.1);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("🏪 اسم المتجر", storeName)}
          ${row("📋 نوع الإعلان", adType)}
          ${row("⭐ الفئة", tierDisplay)}
          ${description ? row("📝 النبذة", description) : ""}
          ${row("📍 المدينة", city)}
          ${row("📞 رقم التواصل", phone || "غير محدد")}
          ${row("📧 إيميل العميل", customerEmail || "لم يحدد")}
          ${row("💰 السعر", priceDisplay, true)}
        </table>
      </div>
      <div style="text-align:center;padding-top:16px;margin-top:16px;border-top:1px solid rgba(61,139,110,0.08);">
        <p style="color:${TEXT_LIGHT};font-size:11px;margin:0;">👓 تطبيق لمحة للتسويق الإلكتروني</p>
        <p style="color:${TEXT_LIGHT};font-size:10px;margin:4px 0 0;">هذا الإيميل مرسل تلقائياً</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "لمحة للتسويق <info@lamha.trndsky.com>",
        to: [adminEmail],
        subject: `طلب إعلان جديد #${orderNumber} - ${storeName}`,
        html: adminHtml,
      }),
    });

    // 2. Customer notification
    if (customerEmail) {
      const customerHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Cairo,'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:${CARD_BG};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(61,139,110,0.12);">
    <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});padding:36px 24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">👓</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">لمحة للتسويق الإلكتروني</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">تأكيد استلام طلبك</p>
    </div>
    <div style="padding:28px 24px;text-align:center;">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(61,139,110,0.1);margin:0 auto 16px;line-height:72px;">
        <span style="font-size:36px;">✅</span>
      </div>
      <h2 style="margin:0 0 8px;color:${TEXT_DARK};font-size:21px;font-weight:800;">تم استلام طلبك بنجاح!</h2>
      <p style="color:${TEXT_MUTED};font-size:14px;margin:0 0 24px;">سيتم مراجعة طلبك والتواصل معك قريباً</p>
      
      <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});border-radius:16px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:13px;">رقم الطلب</p>
        <p style="margin:0;color:#fff;font-size:32px;font-weight:900;">#${orderNumber}</p>
      </div>
      
      <div style="background:${BG};border-radius:16px;padding:4px 0;text-align:right;border:1px solid rgba(61,139,110,0.1);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("🏪 اسم المتجر", storeName)}
          ${row("📋 نوع الإعلان", adType)}
          ${row("⭐ الفئة", tierDisplay)}
          ${description ? row("📝 النبذة", description) : ""}
          ${row("📍 المدينة", city)}
          ${row("📞 رقم التواصل", phone || "غير محدد")}
          ${row("📧 البريد الإلكتروني", customerEmail)}
          ${row("💰 السعر", priceDisplay, true)}
        </table>
      </div>

      <div style="margin-top:24px;padding:14px 18px;background:rgba(201,149,43,0.08);border-radius:12px;border:1px solid rgba(201,149,43,0.15);">
        <p style="color:${GOLD};font-size:13px;font-weight:700;margin:0;">📩 سيتم إشعارك عند قبول وبدء إعلانك</p>
      </div>

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(61,139,110,0.08);">
        <p style="color:${TEXT_LIGHT};font-size:11px;margin:0;">👓 تطبيق لمحة للتسويق الإلكتروني</p>
        <p style="color:${TEXT_LIGHT};font-size:10px;margin:4px 0 0;">احتفظ برقم الطلب للمتابعة</p>
      </div>
    </div>
  </div>
</body>
</html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "لمحة للتسويق <info@lamha.trndsky.com>",
          to: [customerEmail],
          subject: `تأكيد طلب إعلانك #${orderNumber} - لمحة للتسويق`,
          html: customerHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
