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

function toYYMMDD(dateStr) {
  return dateStr.replace(/-/g, '').slice(2);
}

/**
 * Enlace de comparación a los resultados de búsqueda de Skyscanner.
 * No requiere credenciales de afiliado: es la URL pública de resultados,
 * pensada para dar una alternativa de comparación y generar tráfico aunque
 * de momento no genere comisión.
 */
export function buildSkyscannerLink({ origin, destination, departDate, returnDate }) {
  let path = `/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${toYYMMDD(departDate)}`;
  if (returnDate) {
    path += `/${toYYMMDD(returnDate)}`;
  }
  return `https://www.skyscanner.es${path}/`;
}

/**
 * Enlace de afiliado a la búsqueda de hoteles de Booking.com para la ciudad
 * de destino, como venta cruzada tras encontrar el vuelo.
 */
export function buildBookingHotelLink({ city, checkin, checkout, aid }) {
  const url = new URL('https://www.booking.com/searchresults.html');
  url.searchParams.set('aid', aid);
  url.searchParams.set('ss', city);
  if (checkin) url.searchParams.set('checkin', checkin);
  if (checkout) url.searchParams.set('checkout', checkout);
  return url.toString();
}
