const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIREBASE_SA_JSON = Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Firebase Auth via Service Account JWT ---

function base64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToArrayBuffer(str: string): ArrayBuffer {
  const enc = new TextEncoder();
  return enc.encode(str).buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function getAccessToken(): Promise<string> {
  const sa = JSON.parse(FIREBASE_SA_JSON);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64url(strToArrayBuffer(JSON.stringify(header)));
  const encodedPayload = base64url(strToArrayBuffer(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    strToArrayBuffer(signingInput)
  );

  const jwt = `${signingInput}.${base64url(signature)}`;

  const tokenRes = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

// --- FCM v1 Send ---

async function sendFCM(accessToken: string, token: string, title: string, body: string) {
  const sa = JSON.parse(FIREBASE_SA_JSON);
  const projectId = sa.project_id;

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          apns: {
            payload: { aps: { sound: "default", badge: 1 } },
          },
          android: {
            notification: { sound: "default" },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`FCM send failed for token ${token.slice(0, 10)}...: ${err}`);
    return false;
  }
  return true;
}

// --- Main Handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Fetch enabled notification settings
    const { data: settingsData, error: settingsErr } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("enabled", true);

    if (settingsErr) throw settingsErr;
    if (!settingsData || settingsData.length === 0) {
      return new Response(JSON.stringify({ message: "No enabled settings" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken();
    let totalSent = 0;

    for (const setting of settingsData) {
      const hoursMs = setting.hours_before * 60 * 60 * 1000;
      const now = new Date();
      const deadline = new Date(now.getTime() + hoursMs);

      // 2. Find active ads in this category ending within hours_before
      const { data: ads } = await supabase
        .from("ads")
        .select("id, shop_name, offer, city, category, end_date")
        .eq("category", setting.category_id)
        .eq("active", true)
        .gte("end_date", now.toISOString())
        .lte("end_date", deadline.toISOString());

      if (!ads || ads.length === 0) continue;

      for (const ad of ads) {
        // 3. Check if already sent
        const { data: existing } = await supabase
          .from("sent_notifications")
          .select("id")
          .eq("ad_id", ad.id)
          .eq("notification_type", `reminder_${setting.hours_before}h`);

        if (existing && existing.length > 0) continue;

        // 4. Get target tokens
        let tokensQuery = supabase.from("device_tokens").select("token");

        if (setting.target_mode === "city" && ad.city) {
          // Get tokens for this city OR tokens in the same region
          const { data: cityData } = await supabase
            .from("cities")
            .select("region_id")
            .eq("name", ad.city)
            .limit(1);

          if (cityData && cityData.length > 0 && cityData[0].region_id) {
            // Get tokens matching city name OR region_id
            const { data: tokens } = await supabase
              .from("device_tokens")
              .select("token")
              .or(`city.eq.${ad.city},region_id.eq.${cityData[0].region_id}`);

            if (!tokens || tokens.length === 0) continue;

            // Build message from template
            const msgBody = (setting.message_template || "🔔 عرض {shop_name} ينتهي قريباً")
              .replace("{shop_name}", ad.shop_name)
              .replace("{offer}", ad.offer)
              .replace("{city}", ad.city);

            let sentCount = 0;
            for (const t of tokens) {
              const ok = await sendFCM(accessToken, t.token, "لمحة", msgBody);
              if (ok) sentCount++;
            }

            // Record
            await supabase.from("sent_notifications").insert({
              ad_id: ad.id,
              notification_type: `reminder_${setting.hours_before}h`,
              tokens_count: sentCount,
            });

            totalSent += sentCount;
            continue;
          }
        }

        // target_mode = "all" or fallback
        const { data: allTokens } = await tokensQuery;
        if (!allTokens || allTokens.length === 0) continue;

        const msgBody = (setting.message_template || "🔔 عرض {shop_name} ينتهي قريباً")
          .replace("{shop_name}", ad.shop_name)
          .replace("{offer}", ad.offer)
          .replace("{city}", ad.city);

        let sentCount = 0;
        for (const t of allTokens) {
          const ok = await sendFCM(accessToken, t.token, "لمحة", msgBody);
          if (ok) sentCount++;
        }

        await supabase.from("sent_notifications").insert({
          ad_id: ad.id,
          notification_type: `reminder_${setting.hours_before}h`,
          tokens_count: sentCount,
        });

        totalSent += sentCount;
      }
    }

    return new Response(
      JSON.stringify({ success: true, totalSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-auto-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
