// ============================================================
// IP PRINTERS — Product Catalog logic
// ============================================================

const WHATSAPP_NUMBER = "923056232108";

const CATEGORIES = {
  ladies: { label: "Ladies Suit Box", folder: "", count: 21 },
  gents:  { label: "Gents Box",       folder: "",  count: 32, skip: [19,20,21,22,23,24,25] },
  bakery: { label: "Bakery Box",      folder: "", count: 4 },
  pizza:  { label: "Pizza Box",       folder: "",  count: 4 },
  bags:   { label: "Shopping Bags",   folder: "",   count: 4 },
};

function quoteLink(categoryLabel, designNumber){
  const msg = `Hi, I'm interested in getting a quote for ${categoryLabel} (Design #${designNumber}) from IP Printers.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function quoteIconSVG(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Z"/></svg>`;
}

const catalogData = {}; // catKey -> array of { src, label, quoteHref }

function buildGrid(catKey){
  const cat = CATEGORIES[catKey];
  const panel = document.getElementById(`panel-${catKey}`);
  const grid = panel.querySelector('.grid');
  grid.innerHTML = '';

  const skip = new Set(cat.skip || []);
  let shown = 0;
  const items = [];

  for (let i = 1; i <= cat.count; i++){
    if (skip.has(i)) continue;
    shown++;

    const imgSrc = `${cat.folder}/${catKey}-${i}.png`;
    const label = `${cat.label} — ${String(shown).padStart(2,'0')}`;
    const href = quoteLink(cat.label, shown);
    const itemIndex = items.length;
    items.push({ src: imgSrc, label, href });

    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${Math.min(shown * 0.045, 0.5)}s`;

    card.innerHTML = `
      <div class="card-img-wrap" data-cat="${catKey}" data-idx="${itemIndex}">
        <img src="${imgSrc}" alt="${label}" loading="lazy">
      </div>
      <div class="card-body">
        <span class="card-label">${label}</span>
        <a class="card-quote" href="${href}" target="_blank" rel="noopener">
          ${quoteIconSVG()} Get a Quote
        </a>
      </div>
    `;
    grid.appendChild(card);
  }

  catalogData[catKey] = items;
}

function switchCategory(catKey){
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.cat === catKey);
  });
  document.querySelectorAll('.grid-panel').forEach(panel => {
    panel.classList.toggle('is-active', panel.id === `panel-${catKey}`);
  });
}

// ================= LIGHTBOX =================
let lbState = { catKey: null, index: 0 };

function openLightbox(catKey, index){
  lbState = { catKey, index };
  renderLightbox();
  document.getElementById('lbOverlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(){
  document.getElementById('lbOverlay').classList.remove('is-open');
  document.body.style.overflow = '';
}

function renderLightbox(){
  const items = catalogData[lbState.catKey];
  if (!items || !items.length) return;
  const item = items[lbState.index];
  document.getElementById('lbImage').src = item.src;
  document.getElementById('lbImage').alt = item.label;
  document.getElementById('lbLabel').textContent = item.label;
  document.getElementById('lbQuote').href = item.href;
}

function lbStep(delta){
  const items = catalogData[lbState.catKey];
  if (!items || !items.length) return;
  lbState.index = (lbState.index + delta + items.length) % items.length;
  renderLightbox();
}

function initLightbox(){
  document.querySelectorAll('.card-img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      openLightbox(wrap.dataset.cat, Number(wrap.dataset.idx));
    });
  });

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => lbStep(-1));
  document.getElementById('lbNext').addEventListener('click', () => lbStep(1));

  document.getElementById('lbOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'lbOverlay') closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lbOverlay');
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });
}

function init(){
  // Build all grids up front (images lazy-load so this is cheap)
  Object.keys(CATEGORIES).forEach(buildGrid);
  initLightbox();

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catKey = btn.dataset.cat;
      switchCategory(catKey);
      // Scroll catalog into view smoothly on mobile after switching
      const catalog = document.querySelector('.catalog');
      const navHeight = document.getElementById('catNav').offsetHeight;
      const targetY = catalog.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      if (window.scrollY > targetY) {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
