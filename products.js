// ============================================================
// IP PRINTERS — Product Catalog logic
// ============================================================

const WHATSAPP_NUMBER = "923056232108";

const CATEGORIES = {
  ladies: { label: "Ladies Suit Box", folder: "", count: 9 },
  gents:  { label: "Gents Box",       folder: "",  count: 12 },
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

function buildGrid(catKey){
  const cat = CATEGORIES[catKey];
  const panel = document.getElementById(`panel-${catKey}`);
  const grid = panel.querySelector('.grid');
  grid.innerHTML = '';

  for (let i = 1; i <= cat.count; i++){
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${Math.min(i * 0.045, 0.5)}s`;

    const imgSrc = `${cat.folder}/${catKey}-${i}.png`;

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${imgSrc}" alt="${cat.label} design ${i}" loading="lazy">
      </div>
      <div class="card-body">
        <span class="card-label">${cat.label} — ${String(i).padStart(2,'0')}</span>
        <a class="card-quote" href="${quoteLink(cat.label, i)}" target="_blank" rel="noopener">
          ${quoteIconSVG()} Get a Quote
        </a>
      </div>
    `;
    grid.appendChild(card);
  }
}

function switchCategory(catKey){
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.cat === catKey);
  });
  document.querySelectorAll('.grid-panel').forEach(panel => {
    panel.classList.toggle('is-active', panel.id === `panel-${catKey}`);
  });
}

function init(){
  // Build all grids up front (images lazy-load so this is cheap)
  Object.keys(CATEGORIES).forEach(buildGrid);

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
