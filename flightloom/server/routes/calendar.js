import { Router } from 'express';
import { config } from '../config.js';
import { cacheGet, cacheSet } from '../cache.js';
import { fetchMonthMatrix, fetchCityDirections } from '../travelpayoutsClient.js';
import { getCitiesByCode } from '../cityLookup.js';

const router = Router();

const IATA_RE = /^[A-Za-z]{3}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;
const MAX_ANY_DESTINATION_ROUTES = 8;

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function emptyDays(month, totalDays) {
  const days = [];
  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    days.push({ date, price: null, found: false, topDestination: null });
  }
  return days;
}

/**
 * Calendario para un origen/destino concreto: precio por día tal cual lo
 * da Travelpayouts.
 */
async function buildFixedDestinationDays({ originCode, destinationCode, month, currency, totalDays }) {
  const rawEntries = await fetchMonthMatrix({ origin: originCode, destination: destinationCode, month: `${month}-01`, currency });
  const priceByDate = new Map();
  for (const entry of rawEntries) {
    if (entry.depart_date && typeof entry.value === 'number') {
      priceByDate.set(entry.depart_date, entry.value);
    }
  }

  const days = [];
  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const price = priceByDate.get(date);
    days.push({ date, price: price ?? null, found: price !== undefined, topDestination: null });
  }
  return days;
}

/**
 * Calendario para "cualquier destino": no existe un endpoint de Travelpayouts
 * que dé directamente "el más barato cada día a cualquier sitio" con cobertura
 * de mes completo, así que se pide el calendario de precios por separado para
 * cada uno de los destinos más baratos encontrados desde el origen (mismos
 * datos que el explorador) y se combinan, quedándonos con el más barato de
 * cada día. Esto da cobertura real día a día en cualquier mes, no solo en las
 * fechas exactas de las "mejores ofertas" encontradas.
 */
async function buildAnyDestinationDays({ originCode, month, currency, totalDays }) {
  const cities = await getCitiesByCode();

  let candidateCodes = [];
  try {
    const raw = await fetchCityDirections({ origin: originCode, currency });
    candidateCodes = Object.entries(raw)
      .filter(([, info]) => typeof info.price === 'number')
      .sort((a, b) => a[1].price - b[1].price)
      .slice(0, MAX_ANY_DESTINATION_ROUTES)
      .map(([code]) => code);
  } catch (err) {
    console.error('Aviso: no se pudieron cargar destinos baratos desde el origen:', err.message);
  }

  if (!candidateCodes.length) {
    return { days: emptyDays(month, totalDays), topOffers: [] };
  }

  const matrices = await Promise.all(
    candidateCodes.map(async (code) => {
      try {
        const entries = await fetchMonthMatrix({ origin: originCode, destination: code, month: `${month}-01`, currency });
        return { code, entries };
      } catch (err) {
        console.error(`Aviso: no se pudo obtener el calendario para ${originCode}->${code}:`, err.message);
        return { code, entries: [] };
      }
    })
  );

  const bestByDate = new Map();
  const bestByDestination = new Map();
  for (const { code, entries } of matrices) {
    for (const entry of entries) {
      if (!entry.depart_date || typeof entry.value !== 'number') continue;

      const existingDay = bestByDate.get(entry.depart_date);
      if (!existingDay || entry.value < existingDay.price) {
        bestByDate.set(entry.depart_date, { code, price: entry.value });
      }

      const existingDest = bestByDestination.get(code);
      if (!existingDest || entry.value < existingDest.price) {
        bestByDestination.set(code, { date: entry.depart_date, price: entry.value });
      }
    }
  }

  const days = [];
  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const best = bestByDate.get(date);
    if (!best) {
      days.push({ date, price: null, found: false, topDestination: null });
      continue;
    }
    const meta = cities.get(best.code);
    days.push({
      date,
      price: best.price,
      found: true,
      topDestination: { code: best.code, cityName: meta ? meta.city : best.code, flag: meta ? meta.flag : '🌍' },
    });
  }

  const topOffers = [...bestByDestination.entries()]
    .map(([code, info]) => {
      const meta = cities.get(code);
      return { code, cityName: meta ? meta.city : code, flag: meta ? meta.flag : '🌍', date: info.date, price: info.price };
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  return { days, topOffers };
}

router.get('/', async (req, res) => {
  if (!config.travelpayoutsConfigured) {
    return res.status(503).json({ error: 'El calendario de precios aún no está configurado en este servidor.' });
  }

  const { origin, destination = '', month, currency = config.defaultCurrency } = req.query;

  if (!origin || !IATA_RE.test(origin)) {
    return res.status(400).json({ error: 'Parámetro "origin" inválido o ausente (código IATA de 3 letras).' });
  }
  if (!month || !MONTH_RE.test(month)) {
    return res.status(400).json({ error: 'Parámetro "month" inválido o ausente (formato YYYY-MM).' });
  }
  if (destination && !IATA_RE.test(destination)) {
    return res.status(400).json({ error: 'Parámetro "destination" inválido (código IATA de 3 letras).' });
  }

  const originCode = origin.toUpperCase();
  const destinationCode = destination ? destination.toUpperCase() : '';
  const cacheKey = `calendar:${originCode}:${destinationCode || 'any'}:${month}:${currency}`;

  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const [year, monthNum] = month.split('-').map(Number);
    const totalDays = daysInMonth(year, monthNum);

    let days;
    let topOffers = [];

    if (destinationCode) {
      days = await buildFixedDestinationDays({ originCode, destinationCode, month, currency, totalDays });
    } else {
      ({ days, topOffers } = await buildAnyDestinationDays({ originCode, month, currency, totalDays }));
    }

    const payload = { origin: originCode, destination: destinationCode || null, month, currency, days, topOffers };
    cacheSet(cacheKey, payload, config.calendarCacheTtl);
    res.json(payload);
  } catch (err) {
    console.error('Error consultando calendario de Travelpayouts:', err.message);
    res.status(502).json({ error: 'No se pudo obtener el calendario de precios.' });
  }
});

export default router;
