import { Router } from 'express';
import { config } from '../config.js';
import { cacheGet, cacheSet } from '../cache.js';
import { fetchCityDirections } from '../travelpayoutsClient.js';
import { getCitiesByCode } from '../cityLookup.js';

const router = Router();
const IATA_RE = /^[A-Za-z]{3}$/;

router.get('/', async (req, res) => {
  if (!config.travelpayoutsConfigured) {
    return res.status(503).json({ error: 'El explorador de destinos aún no está configurado en este servidor.' });
  }

  const { origin, currency = config.defaultCurrency } = req.query;

  if (!origin || !IATA_RE.test(origin)) {
    return res.status(400).json({ error: 'Parámetro "origin" inválido o ausente (código IATA de 3 letras).' });
  }

  const originCode = origin.toUpperCase();
  const cacheKey = `destinations:${originCode}:${currency}`;

  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const raw = await fetchCityDirections({ origin: originCode, currency });
    const cities = await getCitiesByCode();

    const destinations = Object.entries(raw)
      .map(([code, info]) => {
        const meta = cities.get(code);
        return {
          destination: code,
          cityName: meta ? meta.city : code,
          country: meta ? meta.country : null,
          flag: meta ? meta.flag : '🌍',
          price: info.price,
          departureAt: info.departure_at || null,
          returnAt: info.return_at || null,
        };
      })
      .filter((d) => typeof d.price === 'number')
      .sort((a, b) => a.price - b.price);

    const payload = { origin: originCode, currency, destinations };
    cacheSet(cacheKey, payload, config.destinationsCacheTtl);
    res.json(payload);
  } catch (err) {
    console.error('Error consultando destinos baratos de Travelpayouts:', err.message);
    res.status(502).json({ error: 'No se pudo obtener la lista de destinos baratos.' });
  }
});

export default router;
