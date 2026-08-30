import { getCheapestDestinations, getSearchLink } from './api.js';
import { renderNav, loadCities, populateDatalist, getSavedOrigin, saveOrigin, extractIataCode, showError } from './common.js';

renderNav('/explorer.html');

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
  data.destinations.forEach((dest) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow';
    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-semibold text-slate-800">${dest.cityName}</h3>
        <span class="text-xs text-slate-400">${dest.destination}</span>
      </div>
      <p class="text-sm text-slate-500 mb-2">${dest.country || ''}</p>
      <div class="flex items-end justify-between">
        <span class="text-2xl font-bold text-sky-600">${Math.round(dest.price)} ${data.currency}</span>
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
