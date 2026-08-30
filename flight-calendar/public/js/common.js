const NAV_ITEMS = [
  { href: '/index.html', label: 'Calendario' },
  { href: '/explorer.html', label: 'Explorar destinos' },
  { href: '/search.html', label: 'Buscar vuelos' },
];

export function renderNav(activeHref) {
  const header = document.getElementById('app-header');
  if (!header) return;

  const currentPath = window.location.pathname === '/' ? '/index.html' : window.location.pathname;

  header.innerHTML = `
    <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
      <a href="/index.html" class="text-xl font-bold text-sky-600">✈️ FlightCalendar</a>
      <nav class="flex gap-1 sm:gap-2">
        ${NAV_ITEMS.map(
          (item) => `
          <a href="${item.href}"
             class="px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
               (activeHref || currentPath) === item.href
                 ? 'bg-sky-600 text-white'
                 : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
             }">
            ${item.label}
          </a>`
        ).join('')}
      </nav>
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
    return localStorage.getItem('flightcalendar:origin') || '';
  } catch {
    return '';
  }
}

export function saveOrigin(code) {
  try {
    localStorage.setItem('flightcalendar:origin', code.toUpperCase());
  } catch {
    // localStorage no disponible; no es crítico, simplemente no se recuerda el origen.
  }
}

export function extractIataCode(inputValue) {
  const match = inputValue.match(/\(([A-Za-z]{3})\)\s*$/);
  if (match) return match[1].toUpperCase();
  return inputValue.trim().slice(0, 3).toUpperCase();
}

export function showError(container, message) {
  container.innerHTML = `<div class="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">${message}</div>`;
}
