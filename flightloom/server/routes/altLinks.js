import { Router } from 'express';
import { config } from '../config.js';
import { buildSkyscannerLink, buildBookingHotelLink } from '../affiliateLink.js';

const router = Router();
const IATA_RE = /^[A-Za-z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.get('/skyscanner-link', (req, res) => {
  const { origin, destination, depart_date: departDate, return_date: returnDate } = req.query;

  if (!origin || !IATA_RE.test(origin) || !destination || !IATA_RE.test(destination)) {
    return res.status(400).json({ error: 'Parámetros "origin" y "destination" (código IATA) son obligatorios.' });
  }
  if (!departDate || !DATE_RE.test(departDate)) {
    return res.status(400).json({ error: 'Parámetro "depart_date" inválido o ausente (formato YYYY-MM-DD).' });
  }
  if (returnDate && !DATE_RE.test(returnDate)) {
    return res.status(400).json({ error: 'Parámetro "return_date" inválido (formato YYYY-MM-DD).' });
  }

  const url = buildSkyscannerLink({ origin, destination, departDate, returnDate: returnDate || undefined });
  res.json({ url });
});

router.get('/hotel-link', (req, res) => {
  if (!config.bookingAid) {
    return res.status(503).json({ error: 'La búsqueda de hoteles aún no está configurada en este servidor.' });
  }

  const { city, checkin, checkout } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'Parámetro "city" obligatorio.' });
  }
  if (checkin && !DATE_RE.test(checkin)) {
    return res.status(400).json({ error: 'Parámetro "checkin" inválido (formato YYYY-MM-DD).' });
  }
  if (checkout && !DATE_RE.test(checkout)) {
    return res.status(400).json({ error: 'Parámetro "checkout" inválido (formato YYYY-MM-DD).' });
  }

  const url = buildBookingHotelLink({ city, checkin, checkout, aid: config.bookingAid });
  res.json({ url });
});

export default router;
