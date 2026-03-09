import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BOT_USER_AGENTS = [
  "whatsapp",
  "snapchat",
  "facebook",
  "facebot",
  "twitterbot",
  "telegrambot",
  "discordbot",
  "slackbot",
  "linkedinbot",
  "pinterestbot",
  "skypeuripreview"
];

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const redirectUrl = url.searchParams.get("redirect") || `https://bright-local-deals.lovable.app/ad/${id}`;

  if (!id) {
    return Response.redirect(redirectUrl, 302);
  }

  const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (!isBot) {
    return Response.redirect(redirectUrl, 302);
  }

  const { data: ad } = await supabase.from("ads").select("*").eq("id", id).single();

  if (!ad) {
    return Response.redirect(redirectUrl, 302);
  }

  const { data: adImages } = await supabase
    .from("ad_images")
    .select("image_url")
    .eq("ad_id", id)
    .eq("media_type", "image")
    .order("sort_order", { ascending: true })
    .limit(1);

  const imageUrl = adImages && adImages.length > 0 ? adImages[0].image_url : "https://bright-local-deals.lovable.app/og-logo.png";

  const title = `شاهد الجديد في تطبيق لمحة للتسويق - ${ad.offer}`;
  const description = `${ad.shop_name} | ${ad.city} - ${ad.description || ad.offer}`;

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${req.url}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
  <script>
    window.location.href = "${redirectUrl}";
  </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});