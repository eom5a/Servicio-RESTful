import { getSearchLink } from './api.js';
import { renderNav, renderFooter, loadCities, populateDatalist, getSavedOrigin, saveOrigin, extractIataCode, showError, renderAltLinks } from './common.js';

renderNav('/search.html');
renderFooter();

const form = document.getElementById('search-form');
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const departDateInput = document.getElementById('depart-date');
const returnDateInput = document.getElementById('return-date');
const adultsInput = document.getElementById('adults');
const status = document.getElementById('search-status');
const altLinks = document.getElementById('alt-links');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const origin = extractIataCode(originInput.value);
  const destination = extractIataCode(destinationInput.value);
  const departDate = departDateInput.value;
  const returnDate = returnDateInput.value || undefined;
  saveOrigin(origin);

  status.textContent = 'Generando enlace de búsqueda…';
  try {
    const { url } = await getSearchLink({ origin, destination, departDate, returnDate, adults: adultsInput.value });
    status.textContent = '';
    window.open(url, '_blank', 'noopener');
  } catch (err) {
    showError(status, `No se pudo generar la búsqueda: ${err.message}`);
  }

  const cities = await loadCities();
  const cityName = cities.find((c) => c.code === destination)?.city;
  renderAltLinks(altLinks, { origin, destination, departDate, returnDate, cityName });
});

(async function init() {
  const cities = await loadCities();
  populateDatalist('origin-list', cities);
  populateDatalist('destination-list', cities);
  originInput.value = getSavedOrigin();

  const d = new Date();
  d.setDate(d.getDate() + 30);
  departDateInput.value = d.toISOString().slice(0, 10);
})();
