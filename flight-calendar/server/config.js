import dotenv from 'dotenv';

dotenv.config();

const required = ['TRAVELPAYOUTS_TOKEN', 'TRAVELPAYOUTS_MARKER'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Faltan variables de entorno obligatorias: ${missing.join(', ')}.\n` +
      'Copia .env.example a .env y rellena los valores (ver README.md).'
  );
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  travelpayoutsToken: process.env.TRAVELPAYOUTS_TOKEN,
  travelpayoutsMarker: process.env.TRAVELPAYOUTS_MARKER,
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'EUR',
  calendarCacheTtl: Number(process.env.CALENDAR_CACHE_TTL) || 21600,
  destinationsCacheTtl: Number(process.env.DESTINATIONS_CACHE_TTL) || 43200,
};
