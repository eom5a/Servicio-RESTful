import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';
import calendarRoute from './routes/calendar.js';
import destinationsRoute from './routes/destinations.js';
import searchLinkRoute from './routes/searchLink.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const app = express();

app.use('/api/calendar', calendarRoute);
app.use('/api/cheapest-destinations', destinationsRoute);
app.use('/api/search-link', searchLinkRoute);
app.use(express.static(publicDir));

app.listen(config.port, () => {
  console.log(`Flightloom escuchando en http://localhost:${config.port}`);
});
