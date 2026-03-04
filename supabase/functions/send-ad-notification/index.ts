import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // 1. Send admin notification
    const adminHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;">📢 لمحة للتسويق</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">طلب إعلان جديد</p>
    </div>
    <div style="padding:28px 24px;">
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;">رقم الطلب</td><td style="padding:8px 0;font-weight:700;color:#6366f1;text-align:left;">#${orderNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">نوع الإعلان</td><td style="padding:8px 0;font-weight:600;text-align:left;">${adType}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">الفئة</td><td style="padding:8px 0;font-weight:600;text-align:left;">${adTier}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">اسم المتجر</td><td style="padding:8px 0;font-weight:600;text-align:left;">${storeName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">المدينة</td><td style="padding:8px 0;font-weight:600;text-align:left;">${city}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">السعر</td><td style="padding:8px 0;font-weight:700;color:#10b981;text-align:left;">${totalPrice} ريال</td></tr>
          ${customerEmail ? `<tr><td style="padding:8px 0;color:#64748b;">إيميل العميل</td><td style="padding:8px 0;font-weight:600;text-align:left;">${customerEmail}</td></tr>` : ""}
        </table>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin:0;">هذا الإيميل مرسل تلقائياً من تطبيق لمحة للتسويق</p>
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
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;">📢 لمحة للتسويق</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">تأكيد استلام طلبك</p>
    </div>
    <div style="padding:28px 24px;text-align:center;">
      <div style="width:64px;height:64px;border-radius:50%;background:#f0fdf4;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;">✅</span>
      </div>
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">تم استلام طلبك بنجاح!</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px;">سيتم مراجعة طلبك والتواصل معك قريباً</p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 4px;color:#64748b;font-size:13px;">رقم الطلب</p>
        <p style="margin:0;color:#6366f1;font-size:28px;font-weight:800;">#${orderNumber}</p>
      </div>
      <div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:right;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;">نوع الإعلان</td><td style="padding:6px 0;font-weight:600;text-align:left;">${adType}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">اسم المتجر</td><td style="padding:6px 0;font-weight:600;text-align:left;">${storeName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">المدينة</td><td style="padding:6px 0;font-weight:600;text-align:left;">${city}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">السعر</td><td style="padding:6px 0;font-weight:700;color:#10b981;text-align:left;">${totalPrice} ريال</td></tr>
        </table>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">سيتم إشعارك عند قبول وبدء إعلانك 📩</p>
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
