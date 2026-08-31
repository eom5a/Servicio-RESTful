const NAV_ITEMS = [
  { href: '/index.html', label: 'Calendario' },
  { href: '/explorer.html', label: 'Explorar destinos' },
  { href: '/search.html', label: 'Buscar vuelos' },
];

const LOGO_ICON = `
  <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-3 2v1.5l4.5-1.5 4.5 1.5V21l-3-2v-5.5l8 2.5Z"/>
  </svg>
`;

export function renderNav(activeHref) {
  const header = document.getElementById('app-header');
  if (!header) return;

  const currentPath = window.location.pathname === '/' ? '/index.html' : window.location.pathname;

  header.innerHTML = `
    <div class="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
      <a href="/index.html" class="flex items-center gap-2 group shrink-0">
        <span class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
          ${LOGO_ICON}
        </span>
        <span class="text-lg font-extrabold tracking-tight text-slate-800 whitespace-nowrap">Flightloom</span>
      </a>
      <nav class="flex gap-1 sm:gap-1.5 w-full sm:w-auto justify-center sm:justify-end overflow-x-auto">
        ${NAV_ITEMS.map(
          (item) => `
          <a href="${item.href}"
             class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
               (activeHref || currentPath) === item.href
                 ? 'bg-slate-900 text-white shadow-sm'
                 : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
             }">
            ${item.label}
          </a>`
        ).join('')}
      </nav>
    </div>
  `;
}

export function renderFooter() {
  const footer = document.getElementById('app-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-8 text-center">
      <p class="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Los precios mostrados son orientativos y pueden variar. Flightloom puede recibir una comisión
        por las reservas realizadas a través de los enlaces de este sitio, sin coste adicional para ti.
      </p>
      <p class="text-xs text-slate-300 mt-2">© ${new Date().getFullYear()} Flightloom</p>
    </div>
  `;
}

let citiesPromise = null;

export function loadCities() {
  if (!citiesPromise) {
    citiesPromise = fetch('/data/iata-cities.json').then((r) => r.json());
  }
  return citiesPromise;
}

export function populateDatalist(datalistId, cities) {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;
  datalist.innerHTML = cities
    .map((c) => `<option value="${c.code}">${c.city}, ${c.country} (${c.code})</option>`)
    .join('');
}

export function getSavedOrigin() {
  try {
    return localStorage.getItem('flightloom:origin') || '';
  } catch {
    return '';
  }
}

export function saveOrigin(code) {
  try {
    localStorage.setItem('flightloom:origin', code.toUpperCase());
  } catch {
    // localStorage no disponible; no es crítico, simplemente no se recuerda el origen.
  }
}

export function extractIataCode(inputValue) {
  const trimmed = inputValue.trim();
  const match = trimmed.match(/\(([A-Za-z]{3})\)\s*$/);
  if (match) return match[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return '';
}

export function showError(container, message) {
  container.innerHTML = `<div class="col-span-full rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">${message}</div>`;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function fetchLink(path, params) {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  if (!response.ok) return null;
  const { url: link } = await response.json();
  return link;
}

/**
 * Muestra enlaces secundarios (Skyscanner, hoteles) tras un clic de reserva,
 * sin bloquear la apertura del enlace de afiliado principal. Los que no
 * apliquen (o no estén configurados en el servidor) simplemente no aparecen.
 */
export async function renderAltLinks(container, { origin, destination, departDate, returnDate, cityName }) {
  if (!container) return;
  container.innerHTML = '';
  const links = [];

  if (origin && destination && departDate) {
    const url = await fetchLink('/api/skyscanner-link', {
      origin,
      destination,
      depart_date: departDate,
      return_date: returnDate,
    });
    if (url) links.push({ label: '🔎 Comparar en Skyscanner', url });
  }

  if (cityName) {
    const url = await fetchLink('/api/hotel-link', {
      city: cityName,
      checkin: departDate,
      checkout: returnDate || (departDate ? addDays(departDate, 3) : undefined),
    });
    if (url) links.push({ label: `🏨 Hoteles en ${cityName}`, url });
  }

  if (!links.length) return;

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
      <span class="text-slate-400">También puedes:</span>
      ${links
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank" rel="noopener" class="text-sky-600 hover:text-sky-700 font-semibold underline underline-offset-2">${l.label}</a>`
        )
        .join('')}
    </div>
  `;
}
