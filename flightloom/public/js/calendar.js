import { getCalendar, getSearchLink } from './api.js';
import { renderNav, renderFooter, loadCities, populateDatalist, getSavedOrigin, saveOrigin, extractIataCode, showError, renderAltLinks } from './common.js';

renderNav('/index.html');
renderFooter();

const form = document.getElementById('calendar-form');
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const monthInput = document.getElementById('month');
const grid = document.getElementById('calendar-grid');
const status = document.getElementById('calendar-status');
const monthLabel = document.getElementById('month-label');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const altLinks = document.getElementById('alt-links');

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function defaultMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function priceToColor(price, min, max) {
  if (min === max) return 'hsl(120, 65%, 88%)';
  const ratio = (price - min) / (max - min);
  const hue = 120 - ratio * 120; // 120 verde -> 0 rojo
  return `hsl(${hue}, 70%, 85%)`;
}

async function openBookingLink(day) {
  const origin = extractIataCode(originInput.value);
  const fixedDestination = destinationInput.value ? extractIataCode(destinationInput.value) : undefined;
  const destination = fixedDestination || day.topDestination?.code;
  const cityName = day.topDestination?.cityName;

  try {
    const { url } = await getSearchLink({ origin, destination, departDate: day.date });
    window.open(url, '_blank', 'noopener');
  } catch (err) {
    alert(`No se pudo generar el enlace de reserva: ${err.message}`);
  }

  renderAltLinks(altLinks, { origin, destination, departDate: day.date, cityName });
}

function renderGrid(data) {
  const foundDays = data.days.filter((d) => d.found);
  const min = foundDays.length ? Math.min(...foundDays.map((d) => d.price)) : null;
  const max = foundDays.length ? Math.max(...foundDays.map((d) => d.price)) : null;

  const [year, month] = data.month.split('-').map(Number);
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // lunes=0

  grid.innerHTML = '';
  WEEKDAYS.forEach((w) => {
    const el = document.createElement('div');
    el.className = 'text-center text-xs font-semibold text-slate-400 pb-1';
    el.textContent = w;
    grid.appendChild(el);
  });

  for (let i = 0; i < firstWeekday; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'day-cell day-cell--empty';
    grid.appendChild(empty);
  }

  data.days.forEach((day) => {
    const cell = document.createElement('div');
    const dayNum = Number(day.date.split('-')[2]);
    if (day.found) {
      cell.className = 'day-cell rounded-xl p-2 sm:p-3 cursor-pointer text-center border border-black/5 shadow-sm';
      cell.style.backgroundColor = priceToColor(day.price, min, max);
      const destinationLine = day.topDestination
        ? `<div class="text-[10px] sm:text-xs font-bold text-slate-700 mt-0.5 truncate">${day.topDestination.flag} ${day.topDestination.cityName}</div>`
        : '';
      cell.innerHTML = `
        <div class="text-sm font-bold text-slate-800">${dayNum}</div>
        <div class="text-xs sm:text-sm font-semibold text-slate-700">${Math.round(day.price)} ${data.currency}</div>
        ${destinationLine}
      `;
      cell.addEventListener('click', () => openBookingLink(day));
    } else {
      cell.className = 'day-cell day-cell--unavailable rounded-xl p-2 sm:p-3 text-center bg-slate-100 text-slate-300';
      cell.innerHTML = `<div class="text-sm">${dayNum}</div><div class="text-xs">—</div>`;
    }
    grid.appendChild(cell);
  });

  monthLabel.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
}

async function loadCalendar() {
  const origin = extractIataCode(originInput.value);
  if (!origin) {
    showError(grid, 'Introduce un origen válido.');
    return;
  }
  saveOrigin(origin);

  const destination = destinationInput.value ? extractIataCode(destinationInput.value) : '';
  const month = monthInput.value;

  status.textContent = 'Cargando precios…';
  grid.innerHTML = '';
  prevBtn.disabled = true;
  nextBtn.disabled = true;

  try {
    const data = await getCalendar({ origin, destination, month });
    renderGrid(data);
    status.textContent = '';
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  } catch (err) {
    showError(grid, `No se pudo cargar el calendario: ${err.message}`);
    status.textContent = '';
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadCalendar();
});

prevBtn.addEventListener('click', () => {
  monthInput.value = shiftMonth(monthInput.value, -1);
  loadCalendar();
});

nextBtn.addEventListener('click', () => {
  monthInput.value = shiftMonth(monthInput.value, 1);
  loadCalendar();
});

(async function init() {
  const cities = await loadCities();
  populateDatalist('origin-list', cities);
  populateDatalist('destination-list', cities);

  originInput.value = getSavedOrigin();
  monthInput.value = defaultMonth();

  if (originInput.value) {
    loadCalendar();
  }
})();
