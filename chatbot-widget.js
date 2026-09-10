/**
 * IP Printers — Chat Widget (v2: AI chat + quick options)
 */

(function () {
  "use strict";

  const CONFIG = {
    whatsappNumber: "923056232108",
    brandName: "IP Printers",
    greeting: "Assalam o Alaikum! Kuch bhi pooch sakte hain — packaging, pricing, delivery, kuch bhi.",
    apiEndpoint: "/api/chat",
    quickOptions: [
      { label: "Products", prompt: "Aap kya kya products banate hain?" },
      { label: "Pricing & MOQ", prompt: "Pricing aur minimum order quantity kya hai?" },
      { label: "Delivery", prompt: "Delivery mein kitna time lagta hai?" },
      { label: "Custom Order", prompt: "Mujhe custom size/design chahiye, ye ho sakta hai?" },
    ],
  };

  function waLink(text) {
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

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
    position: fixed; bottom: 22px; right: 22px; width: 58px; height: 58px;
    border-radius: 50%;
    background: linear-gradient(155deg, var(--ipw-navy) 0%, var(--ipw-navy-soft) 100%);
    border: 1.5px solid var(--ipw-orange);
    box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    cursor: pointer; z-index: 2147483000;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.18s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .ipw-fab:hover { transform: scale(1.06); }
  .ipw-fab .ipw-mono { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; color: var(--ipw-orange-soft); }
  .ipw-fab-badge {
    position: absolute; top: -3px; right: -3px; width: 12px; height: 12px;
    border-radius: 50%; background: var(--ipw-orange); border: 2px solid var(--ipw-navy);
  }

  .ipw-panel {
    position: fixed; bottom: 92px; right: 22px; width: 360px;
    max-width: calc(100vw - 32px); height: 500px; max-height: 72vh;
    background: var(--ipw-navy); border: 1px solid var(--ipw-line); border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.45);
    display: none; flex-direction: column; overflow: hidden;
    z-index: 2147483000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .ipw-panel.ipw-open { display: flex; }

  .ipw-header {
    display: flex; align-items: center; gap: 10px; padding: 14px 16px;
    background: var(--ipw-navy-soft); border-bottom: 1px solid var(--ipw-line); flex-shrink: 0;
  }
  .ipw-header .ipw-mono-badge {
    width: 32px; height: 32px; border-radius: 8px; background: var(--ipw-navy);
    border: 1px solid var(--ipw-orange); display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: var(--ipw-orange-soft); flex-shrink: 0;
  }
  .ipw-header-text { flex: 1; min-width: 0; }
  .ipw-header-title { color: var(--ipw-cream); font-size: 14px; font-weight: 600; margin: 0; }
  .ipw-header-sub { color: rgba(244,239,230,0.55); font-size: 11.5px; margin: 1px 0 0; }
  .ipw-close { background: none; border: none; color: rgba(244,239,230,0.6); font-size: 20px; line-height: 1; cursor: pointer; padding: 4px; }
  .ipw-close:hover { color: var(--ipw-cream); }

  .ipw-body { padding: 14px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; }

  .ipw-msg { max-width: 85%; font-size: 13px; line-height: 1.5; white-space: pre-line; padding: 9px 12px; border-radius: 10px; }
  .ipw-msg-bot { align-self: flex-start; background: var(--ipw-navy-soft); border: 1px solid var(--ipw-line); color: var(--ipw-cream); }
  .ipw-msg-user { align-self: flex-end; background: var(--ipw-orange); color: var(--ipw-navy); font-weight: 500; }
  .ipw-msg-typing { align-self: flex-start; background: var(--ipw-navy-soft); border: 1px solid var(--ipw-line); color: rgba(244,239,230,0.5); font-size: 13px; padding: 9px 12px; border-radius: 10px; }

  .ipw-quick-row { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 2px; }
  .ipw-quick-btn {
    background: var(--ipw-navy-soft); border: 1px solid var(--ipw-line); border-radius: 20px;
    padding: 6px 12px; color: var(--ipw-cream); font-size: 12px; cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .ipw-quick-btn:hover { border-color: var(--ipw-orange); background: rgba(232,121,47,0.08); }

  .ipw-action-btn {
    display: inline-block; text-align: center; text-decoration: none; background: var(--ipw-orange);
    color: var(--ipw-navy); font-weight: 600; font-size: 12.5px; padding: 8px 12px; border-radius: 8px;
    margin-top: 2px; align-self: flex-start;
  }
  .ipw-action-btn:hover { background: var(--ipw-orange-soft); }

  .ipw-inputbar {
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    border-top: 1px solid var(--ipw-line); background: var(--ipw-navy-soft); flex-shrink: 0;
  }
  .ipw-input {
    flex: 1; background: var(--ipw-navy); border: 1px solid var(--ipw-line); border-radius: 20px;
    padding: 9px 14px; color: var(--ipw-cream); font-size: 13px; outline: none;
  }
  .ipw-input:focus { border-color: var(--ipw-orange); }
  .ipw-input::placeholder { color: rgba(244,239,230,0.4); }
  .ipw-send {
    width: 34px; height: 34px; border-radius: 50%; background: var(--ipw-orange); border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ipw-send:hover { background: var(--ipw-orange-soft); }
  .ipw-send:disabled { opacity: 0.5; cursor: default; }
  .ipw-send svg { width: 15px; height: 15px; }

  @media (max-width: 420px) {
    .ipw-panel { right: 16px; bottom: 84px; width: calc(100vw - 32px); height: 68vh; }
    .ipw-fab { right: 16px; bottom: 16px; }
  }
  `;

  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

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
        <p class="ipw-header-sub">Aap kuch bhi pooch sakte hain</p>
      </div>
      <button class="ipw-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="ipw-body" id="ipw-body"></div>
    <div class="ipw-inputbar">
      <input class="ipw-input" id="ipw-input" type="text" placeholder="Apna sawal likhein..." />
      <button class="ipw-send" id="ipw-send" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 11L21 3L13 21L11 13L3 11Z" fill="#0B0F14"/>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const bodyEl = panel.querySelector("#ipw-body");
  const closeBtn = panel.querySelector(".ipw-close");
  const inputEl = panel.querySelector("#ipw-input");
  const sendBtn = panel.querySelector("#ipw-send");

  let history = [];

  function addMessage(role, text) {
    const el = document.createElement("div");
    el.className = "ipw-msg " + (role === "user" ? "ipw-msg-user" : "ipw-msg-bot");
    el.textContent = text;
    bodyEl.appendChild(el);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return el;
  }

  function addWhatsappCta(prefillText) {
    const a = document.createElement("a");
    a.className = "ipw-action-btn";
    a.textContent = "WhatsApp pe Baat Karein";
    a.href = waLink(prefillText || "Hi, I have a question.");
    a.target = "_blank";
    a.rel = "noopener";
    bodyEl.appendChild(a);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function renderQuickOptions() {
    const row = document.createElement("div");
    row.className = "ipw-quick-row";
    CONFIG.quickOptions.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "ipw-quick-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => sendMessage(opt.prompt));
      row.appendChild(btn);
    });
    bodyEl.appendChild(row);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function renderInitial() {
    bodyEl.innerHTML = "";
    addMessage("bot", CONFIG.greeting);
    renderQuickOptions();
  }

  async function sendMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    history.push({ role: "user", content: trimmed });
    inputEl.value = "";
    sendBtn.disabled = true;

    const typingEl = document.createElement("div");
    typingEl.className = "ipw-msg-typing";
    typingEl.textContent = "Type kar raha hai...";
    bodyEl.appendChild(typingEl);
    bodyEl.scrollTop = bodyEl.scrollHeight;

    try {
      const res = await fetch(CONFIG.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typingEl.remove();

      if (!res.ok || data.error) {
        addMessage("bot", "Maazrat, abhi jawab nahi de saka.");
        addWhatsappCta(trimmed);
      } else {
        addMessage("bot", data.reply);
        history.push({ role: "assistant", content: data.reply });
      }
    } catch (err) {
      typingEl.remove();
      addMessage("bot", "Connection mein masla aa gaya — seedha WhatsApp pe bata dein.");
      addWhatsappCta(trimmed);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  function openPanel() {
    panel.classList.add("ipw-open");
    if (!bodyEl.childElementCount) renderInitial();
    inputEl.focus();
  }
  function closePanel() {
    panel.classList.remove("ipw-open");
  }

  fab.addEventListener("click", () => {
    panel.classList.contains("ipw-open") ? closePanel() : openPanel();
  });
  closeBtn.addEventListener("click", closePanel);
  sendBtn.addEventListener("click", () => sendMessage(inputEl.value));
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage(inputEl.value);
  });
})();
