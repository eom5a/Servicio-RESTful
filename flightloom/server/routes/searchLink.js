import { Router } from 'express';
import { buildSearchLink } from '../affiliateLink.js';

const router = Router();
const IATA_RE = /^[A-Za-z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.get('/', (req, res) => {
  const { origin, destination = '', depart_date: departDate, return_date: returnDate, adults = '1' } = req.query;

  if (!origin || !IATA_RE.test(origin)) {
    return res.status(400).json({ error: 'Parámetro "origin" inválido o ausente (código IATA de 3 letras).' });
  }
  if (!departDate || !DATE_RE.test(departDate)) {
    return res.status(400).json({ error: 'Parámetro "depart_date" inválido o ausente (formato YYYY-MM-DD).' });
  }
  if (destination && !IATA_RE.test(destination)) {
    return res.status(400).json({ error: 'Parámetro "destination" inválido (código IATA de 3 letras).' });
  }
  if (returnDate && !DATE_RE.test(returnDate)) {
    return res.status(400).json({ error: 'Parámetro "return_date" inválido (formato YYYY-MM-DD).' });
  }

  const adultsNum = Number(adults);
  if (!Number.isInteger(adultsNum) || adultsNum < 1 || adultsNum > 9) {
    return res.status(400).json({ error: 'Parámetro "adults" inválido (entero entre 1 y 9).' });
  }

  const url = buildSearchLink({
    origin,
    destination: destination || undefined,
    departDate,
    returnDate: returnDate || undefined,
    adults: adultsNum,
  });

  res.json({ url });
});

export default router;
