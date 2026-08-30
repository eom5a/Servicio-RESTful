import { config } from './config.js';

function toDDMM(dateStr) {
  const [, month, day] = dateStr.split('-');
  return `${day}${month}`;
}

/**
 * Construye un deep-link de afiliado a Aviasales con el marker configurado,
 * para que las reservas realizadas a través del enlace generen comisión.
 * Formato: /search/{origin}{DDMM}{destination}{DDMM_vuelta?}{adultos}?marker=
 */
export function buildSearchLink({ origin, destination, departDate, returnDate, adults = 1 }) {
  let path = `${origin.toUpperCase()}${toDDMM(departDate)}`;
  if (destination) {
    path += destination.toUpperCase();
  }
  if (returnDate) {
    path += toDDMM(returnDate);
  }
  path += String(adults);

  const url = new URL(`https://www.aviasales.com/search/${path}`);
  url.searchParams.set('marker', config.travelpayoutsMarker);
  return url.toString();
}
