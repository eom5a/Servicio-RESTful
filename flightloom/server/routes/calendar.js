import { Router } from 'express';
import { config } from '../config.js';
import { cacheGet, cacheSet } from '../cache.js';
import { fetchMonthMatrix } from '../travelpayoutsClient.js';

const router = Router();

const IATA_RE = /^[A-Za-z]{3}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
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
    const rawEntries = await fetchMonthMatrix({
      origin: originCode,
      destination: destinationCode,
      month: `${month}-01`,
      currency,
    });

    const priceByDate = new Map();
    for (const entry of rawEntries) {
      if (entry.depart_date && typeof entry.value === 'number') {
        priceByDate.set(entry.depart_date, entry.value);
      }
    }

    const totalDays = daysInMonth(year, monthNum);
    const days = [];
    for (let day = 1; day <= totalDays; day += 1) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const price = priceByDate.get(date);
      days.push({ date, price: price ?? null, found: price !== undefined });
    }

    const payload = { origin: originCode, destination: destinationCode || null, month, currency, days };
    cacheSet(cacheKey, payload, config.calendarCacheTtl);
    res.json(payload);
  } catch (err) {
    console.error('Error consultando calendario de Travelpayouts:', err.message);
    res.status(502).json({ error: 'No se pudo obtener el calendario de precios.' });
  }
});

export default router;
