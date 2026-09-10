/**
 * IP Printers — AI Chat Endpoint (Vercel Serverless Function)
 */

const SYSTEM_PROMPT = `You are the website assistant for IP Printers, a packaging manufacturer based in Faisalabad, Pakistan.

ONLY answer questions about IP Printers and its business. Reply in a natural mix of Roman Urdu and English (matching how a Pakistani customer would text), short and friendly, like a helpful sales rep — not a formal essay.

BUSINESS FACTS (use only these — never invent numbers, prices, or claims not listed here):
- Company: IP Printers, Faisalabad, Pakistan. 20+ years of hands-on packaging manufacturing experience.
- Production: fully in-house, from raw board to finished carton. Full, high-quality board and print stock on every job — no shortcuts.
- Product categories: Ladies Suit Box (21 designs), Gents Box (25 designs), Bakery Box (4 designs), Pizza Box (4 designs), Shopping Bags (4 designs).
- Customization: custom sizes, materials, and finishes are available on request.
- Minimum order: 500 units per design/order.
- Pricing: not fixed or published — depends on size, material, and quantity. Always tell the customer to share their requirement on WhatsApp for an exact quote. Never make up a price.
- Delivery: nationwide across Pakistan. Delivery time depends on the order's quantity and location — there is no fixed number of days, so never invent one. Tell them to share order details on WhatsApp to get a delivery estimate.
- Contact: Phone +92 305 6232108 / +92 300 6657035. WhatsApp: https://wa.me/923056232108. Instagram: @ipprinters2. Location: Faisalabad, Pakistan.
- The site also has Products, About Us, and Contact pages, plus Terms, Privacy, Returns, and Shipping policy pages.

RULES:
- If someone asks about anything NOT related to IP Printers or its packaging business (general knowledge, other companies, personal questions, coding help, news, etc.), politely decline and redirect. Say something like: "Yeh hamari website ke mutaliq nahi hai — main sirf IP Printers ki packaging services ke baare mein madad kar sakta hoon. Aap packaging, pricing, ya order ke baare mein pooch sakte hain."
- Never invent facts, prices, delivery times, or policies that aren't listed above.
- For pricing or delivery-time questions, always end by pointing them to WhatsApp (https://wa.me/923056232108) to get exact details.
- Keep replies short — 2-4 sentences max, unless the question genuinely needs a list (e.g. listing product categories).`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server not configured — missing OPENROUTER_API_KEY." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const history = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  if (!history.length) {
    res.status(400).json({ error: "No message provided." });
    return;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        max_tokens: 350,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      res.status(502).json({ error: "AI service error." });
      return;
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Maazrat, abhi jawab nahi de saka — WhatsApp pe seedha message kar dein: https://wa.me/923056232108";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
