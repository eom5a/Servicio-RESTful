import dotenv from 'dotenv';

dotenv.config();

const travelpayoutsToken = process.env.TRAVELPAYOUTS_TOKEN || '';
const travelpayoutsMarker = process.env.TRAVELPAYOUTS_MARKER || '';
const travelpayoutsConfigured = Boolean(travelpayoutsToken && travelpayoutsMarker);

if (!travelpayoutsConfigured) {
  console.warn(
    'Aviso: faltan TRAVELPAYOUTS_TOKEN y/o TRAVELPAYOUTS_MARKER. ' +
      'El servidor arrancará igualmente (para poder servir el sitio y verificar el dominio), ' +
      'pero el calendario, el explorador de destinos y los enlaces de reserva devolverán error ' +
      'hasta que configures esas variables de entorno (ver README.md).'
  );
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  travelpayoutsToken,
  travelpayoutsMarker,
  travelpayoutsConfigured,
  bookingAid: process.env.BOOKING_AID || '',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'EUR',
  calendarCacheTtl: Number(process.env.CALENDAR_CACHE_TTL) || 21600,
  destinationsCacheTtl: Number(process.env.DESTINATIONS_CACHE_TTL) || 43200,
};
