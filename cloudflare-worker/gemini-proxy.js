/**
 * Cloudflare Worker - Gemini API Proxy
 * 
 * 功能：接收前端的 prompt，加上 API Key 後轉發給 Gemini，
 *       讓 API Key 永遠不暴露在瀏覽器端。
 * 
 * 環境變數（在 Cloudflare Dashboard 設定）：
 *   - GEMINI_API_KEY : 您的 Google Gemini API Key
 *   - ALLOWED_ORIGIN : 您的 GitHub Pages 網址，例如 https://username.github.io
 */

export default {
  async fetch(request, env) {
    // ── CORS 設定 ──────────────────────────────────────────────────────────
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";

    // 允許設定的 origin，或萬用（開發測試用）
    const corsOrigin = (allowedOrigin === "*" || origin === allowedOrigin)
      ? origin || "*"
      : "";

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 處理 preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── 只接受 POST ────────────────────────────────────────────────────────
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    // ── 解析 Body ──────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt } = body;
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 呼叫 Gemini API ────────────────────────────────────────────────────
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const geminiPayload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    try {
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      const geminiData = await geminiResponse.json();

      return new Response(JSON.stringify(geminiData), {
        status: geminiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to reach Gemini API", detail: err.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
