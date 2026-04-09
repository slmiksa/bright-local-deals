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
  return new TextEncoder().encode(str).buffer;
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

async function sendFCM(
  accessToken: string,
  token: string,
  title: string,
  body: string,
  subtitle?: string
) {
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
            payload: {
              aps: { sound: "default", badge: 1, "mutable-content": 1 },
            },
            fcm_options: {},
            ...(subtitle ? { headers: { "apns-subtitle": subtitle } } : {}),
          },
          android: {
            notification: {
              sound: "default",
              ...(subtitle ? { body: `${body}\n${subtitle}` } : {}),
            },
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
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .limit(1);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, body, subtitle, target_mode, city } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target tokens
    let tokensQuery = supabase.from("device_tokens").select("token");

    if (target_mode === "city" && city) {
      // Get tokens for this city or same region
      const { data: cityData } = await supabase
        .from("cities")
        .select("region_id")
        .eq("name", city)
        .limit(1);

      if (cityData && cityData.length > 0 && cityData[0].region_id) {
        const { data: tokens } = await supabase
          .from("device_tokens")
          .select("token")
          .or(`city.eq.${city},region_id.eq.${cityData[0].region_id}`);

      if (!tokens || tokens.length === 0) {
          await supabase.from("manual_notifications").insert({
            title, body, subtitle: subtitle || "",
            target_mode: target_mode || "city", city,
            sent_count: 0, total_count: 0,
          });
          return new Response(
            JSON.stringify({ success: true, sent: 0, total: 0, message: "No tokens found for this city" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const accessToken = await getAccessToken();
        let sentCount = 0;
        for (const t of tokens) {
          const ok = await sendFCM(accessToken, t.token, title, body, subtitle || undefined);
          if (ok) sentCount++;
        }

        await supabase.from("manual_notifications").insert({
          title, body, subtitle: subtitle || "",
          target_mode: target_mode || "city", city,
          sent_count: sentCount, total_count: tokens.length,
        });

        return new Response(
          JSON.stringify({ success: true, sent: sentCount, total: tokens.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // target_mode = "all" or fallback
    const { data: allTokens } = await tokensQuery;
    if (!allTokens || allTokens.length === 0) {
      await supabase.from("manual_notifications").insert({
        title, body, subtitle: subtitle || "",
        target_mode: target_mode || "all", city: city || null,
        sent_count: 0, total_count: 0,
      });
      return new Response(
        JSON.stringify({ success: true, sent: 0, total: 0, message: "No tokens found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getAccessToken();
    let sentCount = 0;
    for (const t of allTokens) {
      const ok = await sendFCM(accessToken, t.token, title, body, subtitle || undefined);
      if (ok) sentCount++;
    }

    await supabase.from("manual_notifications").insert({
      title, body, subtitle: subtitle || "",
      target_mode: target_mode || "all", city: city || null,
      sent_count: sentCount, total_count: allTokens.length,
    });

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: allTokens.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-manual-notification:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
