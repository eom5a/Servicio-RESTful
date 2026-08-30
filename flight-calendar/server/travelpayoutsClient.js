import { config } from './config.js';

const BASE_URL = 'https://api.travelpayouts.com';

async function callTravelpayouts(path, params) {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  }
  url.searchParams.set('token', config.travelpayoutsToken);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Travelpayouts respondió ${response.status} para ${path}`);
  }
  return response.json();
}

/**
 * Calendario de precios más baratos por día para un origen/destino en un mes dado.
 * https://api.travelpayouts.com/v2/prices/month-matrix
 */
export async function fetchMonthMatrix({ origin, destination, month, currency }) {
  const json = await callTravelpayouts('/v2/prices/month-matrix', {
    currency,
    origin,
    destination,
    month,
    show_to_affiliates: true,
  });
  return Array.isArray(json.data) ? json.data : [];
}

/**
 * Destinos más baratos encontrados desde un origen.
 * https://api.travelpayouts.com/v1/city-directions
 */
export async function fetchCityDirections({ origin, currency }) {
  const json = await callTravelpayouts('/v1/city-directions', {
    origin,
    currency,
  });
  return json.data && typeof json.data === 'object' ? json.data : {};
}
