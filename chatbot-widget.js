/**
 * IP Printers — Chat Widget
 * FAQ + lead-capture chat bubble, routes to WhatsApp for real conversations.
 *
 * HOW TO ADD TO YOUR SITE:
 * 1. Copy this file into your project, e.g. js/chatbot-widget.js
 * 2. Add this one line before the closing </body> tag on every page:
 *      <script src="js/chatbot-widget.js" defer></script>
 * 3. Done — no other files need to change. It builds its own markup and styles.
 *
 * To edit the menu, WhatsApp number, or answers: see the CONFIG block below.
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // CONFIG — edit these to update the bot without touching the logic below
  // ---------------------------------------------------------------------
  const CONFIG = {
    whatsappNumber: "923056232108",
    brandName: "IP Printers",
    greeting: "Assalam o Alaikum! Kis cheez mein madad chahiye?",
    menu: [
      {
        id: "products",
        label: "Hamare Products",
        reply:
          "Hum ye categories banatay hain:\n\n• Ladies Suit Box\n• Gents Box\n• Bakery Box\n• Pizza Box\n• Shopping Bags",
        actions: [
          { label: "Products Page Dekhein", href: "/products" },
          { label: "WhatsApp pe Poochein", whatsapp: "Hi, I'd like to know more about your product categories." },
        ],
      },
      {
        id: "pricing",
        label: "Pricing & Minimum Order",
        reply:
          "Minimum order 500 units per design hai. Pricing size, material aur quantity ke hisaab se tay hoti hai — exact quote ke liye apni requirement WhatsApp pe bhej dein.",
        actions: [
          { label: "Quote Mangwayein", whatsapp: "Hi, I'd like a price quote. Here are my details:\n- Product:\n- Quantity:\n- Size:" },
        ],
      },
      {
        id: "delivery",
        label: "Delivery",
        reply:
          "Delivery time order ki quantity aur location par depend karta hai. Hum Pakistan bhar mein deliver karte hain — apna order WhatsApp pe bata dein, hum turant time confirm kar dete hain.",
        actions: [
          { label: "Delivery Time Poochein", whatsapp: "Hi, can you tell me the expected delivery time for my order?" },
        ],
      },
      {
        id: "custom",
        label: "Custom Order",
        reply:
          "Bilkul — hum custom sizes, materials aur finishes bhi print karte hain. Apni requirement bata dein, hum design se le kar delivery tak sambhal lete hain.",
        actions: [
          { label: "Custom Order Discuss Karein", whatsapp: "Hi, I'm interested in a custom packaging order. Here's what I need:" },
        ],
      },
      {
        id: "human",
        label: "Insaan Se Baat Karni Hai",
        reply: "Zaroor — abhi WhatsApp pe connect kar dete hain.",
        actions: [
          { label: "WhatsApp Chat Kholein", whatsapp: "Hi IP Printers, I'd like to talk to someone about an order." },
        ],
      },
    ],
  };

  function waLink(text) {
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  // ---------------------------------------------------------------------
  // STYLES
  // ---------------------------------------------------------------------
  const css = `
  :root {
    --ipw-navy: #0B0F14;
    --ipw-navy-soft: #131A22;
    --ipw-orange: #E8792F;
    --ipw-orange-soft: #F5A05C;
    --ipw-cream: #F4EFE6;
    --ipw-line: rgba(244,239,230,0.10);
  }
  .ipw-fab {
    position: fixed;
    bottom: 22px;
    right: 22px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(155deg, var(--ipw-navy) 0%, var(--ipw-navy-soft) 100%);
    border: 1.5px solid var(--ipw-orange);
    box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    cursor: pointer;
    z-index: 2147483000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.18s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .ipw-fab:hover { transform: scale(1.06); }
  .ipw-fab svg { width: 26px; height: 26px; }
  .ipw-fab .ipw-mono {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--ipw-orange-soft);
  }
  .ipw-fab-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--ipw-orange);
    border: 2px solid var(--ipw-navy);
  }

  .ipw-panel {
    position: fixed;
    bottom: 92px;
    right: 22px;
    width: 340px;
    max-width: calc(100vw - 32px);
    max-height: 70vh;
    background: var(--ipw-navy);
    border: 1px solid var(--ipw-line);
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.45);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 2147483000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .ipw-panel.ipw-open { display: flex; }

  .ipw-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: var(--ipw-navy-soft);
    border-bottom: 1px solid var(--ipw-line);
  }
  .ipw-header .ipw-mono-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--ipw-navy);
    border: 1px solid var(--ipw-orange);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--ipw-orange-soft);
    flex-shrink: 0;
  }
  .ipw-header-text { flex: 1; min-width: 0; }
  .ipw-header-title {
    color: var(--ipw-cream);
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
  .ipw-header-sub {
    color: rgba(244,239,230,0.55);
    font-size: 11.5px;
    margin: 1px 0 0;
  }
  .ipw-close {
    background: none;
    border: none;
    color: rgba(244,239,230,0.6);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 4px;
  }
  .ipw-close:hover { color: var(--ipw-cream); }

  .ipw-body {
    padding: 14px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ipw-bubble {
    background: var(--ipw-navy-soft);
    border: 1px solid var(--ipw-line);
    border-radius: 10px;
    padding: 10px 12px;
    color: var(--ipw-cream);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-line;
  }

  .ipw-menu-btn {
    text-align: left;
    background: var(--ipw-navy-soft);
    border: 1px solid var(--ipw-line);
    border-radius: 9px;
    padding: 11px 12px;
    color: var(--ipw-cream);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .ipw-menu-btn:hover {
    border-color: var(--ipw-orange);
    background: rgba(232,121,47,0.08);
  }

  .ipw-action-btn {
    display: block;
    text-align: center;
    text-decoration: none;
    background: var(--ipw-orange);
    color: var(--ipw-navy);
    font-weight: 600;
    font-size: 13px;
    padding: 10px 12px;
    border-radius: 8px;
    margin-top: 4px;
    transition: background 0.15s ease;
  }
  .ipw-action-btn:hover { background: var(--ipw-orange-soft); }

  .ipw-back-btn {
    align-self: flex-start;
    background: none;
    border: none;
    color: rgba(244,239,230,0.55);
    font-size: 12px;
    cursor: pointer;
    padding: 2px 0 6px;
  }
  .ipw-back-btn:hover { color: var(--ipw-orange-soft); }

  @media (max-width: 420px) {
    .ipw-panel { right: 16px; bottom: 84px; width: calc(100vw - 32px); }
    .ipw-fab { right: 16px; bottom: 16px; }
  }
  `;

  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  // ---------------------------------------------------------------------
  // MARKUP
  // ---------------------------------------------------------------------
  const fab = document.createElement("button");
  fab.className = "ipw-fab";
  fab.setAttribute("aria-label", "Open chat");
  fab.innerHTML = `<span class="ipw-mono">IP</span><span class="ipw-fab-badge"></span>`;

  const panel = document.createElement("div");
  panel.className = "ipw-panel";
  panel.innerHTML = `
    <div class="ipw-header">
      <div class="ipw-mono-badge">IP</div>
      <div class="ipw-header-text">
        <p class="ipw-header-title">${CONFIG.brandName}</p>
        <p class="ipw-header-sub">Usually replies within a few hours</p>
      </div>
      <button class="ipw-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="ipw-body" id="ipw-body"></div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const bodyEl = panel.querySelector("#ipw-body");
  const closeBtn = panel.querySelector(".ipw-close");

  function renderMenu() {
    bodyEl.innerHTML = "";
    const greetBubble = document.createElement("div");
    greetBubble.className = "ipw-bubble";
    greetBubble.textContent = CONFIG.greeting;
    bodyEl.appendChild(greetBubble);

    CONFIG.menu.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "ipw-menu-btn";
      btn.textContent = item.label;
      btn.addEventListener("click", () => renderReply(item));
      bodyEl.appendChild(btn);
    });
  }

  function renderReply(item) {
    bodyEl.innerHTML = "";

    const back = document.createElement("button");
    back.className = "ipw-back-btn";
    back.textContent = "\u2190 Wapas";
    back.addEventListener("click", renderMenu);
    bodyEl.appendChild(back);

    const bubble = document.createElement("div");
    bubble.className = "ipw-bubble";
    bubble.textContent = item.reply;
    bodyEl.appendChild(bubble);

    (item.actions || []).forEach((action) => {
      const a = document.createElement("a");
      a.className = "ipw-action-btn";
      a.textContent = action.label;
      a.href = action.whatsapp ? waLink(action.whatsapp) : action.href;
      if (action.whatsapp) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      bodyEl.appendChild(a);
    });
  }

  function openPanel() {
    panel.classList.add("ipw-open");
    if (!bodyEl.childElementCount) renderMenu();
  }
  function closePanel() {
    panel.classList.remove("ipw-open");
  }

  fab.addEventListener("click", () => {
    if (panel.classList.contains("ipw-open")) {
      closePanel();
    } else {
      openPanel();
    }
  });
  closeBtn.addEventListener("click", closePanel);
})();
