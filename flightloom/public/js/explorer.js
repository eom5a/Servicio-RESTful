import { getCheapestDestinations, getSearchLink } from './api.js';
import { renderNav, renderFooter, loadCities, populateDatalist, getSavedOrigin, saveOrigin, extractIataCode, showError } from './common.js';

renderNav('/explorer.html');
renderFooter();

const ACCENT_COLORS = ['from-sky-500 to-cyan-400', 'from-fuchsia-500 to-violet-400', 'from-amber-500 to-orange-400', 'from-emerald-500 to-teal-400'];

const form = document.getElementById('explorer-form');
const originInput = document.getElementById('origin');
const status = document.getElementById('explorer-status');
const results = document.getElementById('explorer-results');

function toDateOnly(isoLike) {
  return isoLike ? isoLike.slice(0, 10) : undefined;
}

async function openBookingLink(destination) {
  const origin = extractIataCode(originInput.value);
  try {
    const { url } = await getSearchLink({
      origin,
      destination: destination.destination,
      departDate: toDateOnly(destination.departureAt),
      returnDate: toDateOnly(destination.returnAt),
    });
    window.open(url, '_blank', 'noopener');
  } catch (err) {
    alert(`No se pudo generar el enlace de reserva: ${err.message}`);
  }
}

function renderResults(data) {
  if (!data.destinations.length) {
    showError(results, 'No se encontraron destinos baratos para este origen ahora mismo. Prueba con otro origen.');
    return;
  }

  results.innerHTML = '';
  data.destinations.forEach((dest, i) => {
    const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
    const card = document.createElement('div');
    card.className = 'dest-card bg-white rounded-2xl shadow-sm border border-slate-100 p-4 cursor-pointer';
    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${accent} text-white font-bold text-sm shrink-0">
          ${dest.destination.slice(0, 2)}
        </span>
        <div class="min-w-0">
          <h3 class="font-bold text-slate-800 truncate">${dest.cityName}</h3>
          <p class="text-xs text-slate-400 truncate">${dest.country || ''} · ${dest.destination}</p>
        </div>
      </div>
      <div class="flex items-end justify-between">
        <span class="text-2xl font-extrabold text-slate-900">${Math.round(dest.price)} <span class="text-sm font-semibold text-slate-500">${data.currency}</span></span>
        ${dest.departureAt ? `<span class="text-xs text-slate-400">${toDateOnly(dest.departureAt)}</span>` : ''}
      </div>
    `;
    card.addEventListener('click', () => openBookingLink(dest));
    results.appendChild(card);
  });
}

async function loadDestinations() {
  const origin = extractIataCode(originInput.value);
  if (!origin) {
    showError(results, 'Introduce un origen válido.');
    return;
  }
  saveOrigin(origin);

  status.textContent = 'Buscando destinos baratos…';
  results.innerHTML = '';

  try {
    const data = await getCheapestDestinations({ origin });
    renderResults(data);
    status.textContent = '';
  } catch (err) {
    showError(results, `No se pudo cargar la lista de destinos: ${err.message}`);
    status.textContent = '';
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadDestinations();
});

(async function init() {
  const cities = await loadCities();
  populateDatalist('origin-list', cities);
  originInput.value = getSavedOrigin();
  if (originInput.value) {
    loadDestinations();
  }
})();
