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
    const { orderNumber, adType, adTier, storeName, city, totalPrice, customerEmail } = await req.json();

    const adminEmail = "nsaihost@gmail.com";

    const priceDisplay = totalPrice === 0 ? "مجاني" : `${totalPrice} ريال`;

    // 1. Send admin notification
    const adminHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Cairo,'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:${CARD_BG};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(61,139,110,0.12);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});padding:36px 24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">👓</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">لمحة للتسويق الإلكتروني</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">🔔 طلب إعلان جديد</p>
    </div>
    <!-- Body -->
    <div style="padding:28px 24px;">
      <div style="background:${BG};border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid rgba(61,139,110,0.1);">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:${TEXT_DARK};">
          <tr>
            <td style="padding:10px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">رقم الطلب</td>
            <td style="padding:10px 0;font-weight:800;color:${PRIMARY};text-align:left;font-size:16px;border-bottom:1px solid rgba(61,139,110,0.08);">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">نوع الإعلان</td>
            <td style="padding:10px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">${adType}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">الفئة</td>
            <td style="padding:10px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">
              ${adTier === "متميز" ? `<span style="color:${GOLD};font-weight:700;">⭐ ${adTier}</span>` : adTier}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">اسم المتجر</td>
            <td style="padding:10px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">${storeName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">المدينة</td>
            <td style="padding:10px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">${city}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${TEXT_MUTED};">السعر</td>
            <td style="padding:10px 0;font-weight:800;color:${PRIMARY};text-align:left;font-size:15px;">${priceDisplay}</td>
          </tr>
          ${customerEmail ? `<tr><td style="padding:10px 0;color:${TEXT_MUTED};">إيميل العميل</td><td style="padding:10px 0;font-weight:600;text-align:left;">${customerEmail}</td></tr>` : ""}
        </table>
      </div>
      <!-- Footer -->
      <div style="text-align:center;padding-top:8px;border-top:1px solid rgba(61,139,110,0.08);">
        <p style="color:${TEXT_LIGHT};font-size:11px;margin:12px 0 0;">👓 تطبيق لمحة للتسويق الإلكتروني</p>
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

    // 2. Send customer notification if email provided
    if (customerEmail) {
      const customerHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Cairo,'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:${CARD_BG};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(61,139,110,0.12);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});padding:36px 24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">👓</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">لمحة للتسويق الإلكتروني</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">تأكيد استلام طلبك</p>
    </div>
    <!-- Body -->
    <div style="padding:28px 24px;text-align:center;">
      <!-- Success Icon -->
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(61,139,110,0.1);margin:0 auto 16px;line-height:72px;">
        <span style="font-size:36px;">✅</span>
      </div>
      <h2 style="margin:0 0 8px;color:${TEXT_DARK};font-size:21px;font-weight:800;">تم استلام طلبك بنجاح!</h2>
      <p style="color:${TEXT_MUTED};font-size:14px;margin:0 0 24px;">سيتم مراجعة طلبك والتواصل معك قريباً</p>
      
      <!-- Order Number Card -->
      <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});border-radius:16px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:13px;">رقم الطلب</p>
        <p style="margin:0;color:#fff;font-size:32px;font-weight:900;">#${orderNumber}</p>
      </div>
      
      <!-- Details -->
      <div style="background:${BG};border-radius:16px;padding:18px;text-align:right;border:1px solid rgba(61,139,110,0.1);">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:${TEXT_DARK};">
          <tr>
            <td style="padding:8px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">نوع الإعلان</td>
            <td style="padding:8px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">${adType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">اسم المتجر</td>
            <td style="padding:8px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">${storeName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${TEXT_MUTED};border-bottom:1px solid rgba(61,139,110,0.08);">المدينة</td>
            <td style="padding:8px 0;font-weight:600;text-align:left;border-bottom:1px solid rgba(61,139,110,0.08);">${city}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${TEXT_MUTED};">السعر</td>
            <td style="padding:8px 0;font-weight:800;color:${PRIMARY};text-align:left;font-size:15px;">${priceDisplay}</td>
          </tr>
        </table>
      </div>

      <!-- Notice -->
      <div style="margin-top:24px;padding:14px 18px;background:rgba(201,149,43,0.08);border-radius:12px;border:1px solid rgba(201,149,43,0.15);">
        <p style="color:${GOLD};font-size:13px;font-weight:700;margin:0;">📩 سيتم إشعارك عند قبول وبدء إعلانك</p>
      </div>

      <!-- Footer -->
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
