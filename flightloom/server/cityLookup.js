import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { flagFor } from './countryFlags.js';

const citiesPath = fileURLToPath(new URL('../public/data/iata-cities.json', import.meta.url));
let citiesByCode = null;

export async function getCitiesByCode() {
  if (!citiesByCode) {
    const raw = await readFile(citiesPath, 'utf-8');
    const list = JSON.parse(raw);
    citiesByCode = new Map(list.map((c) => [c.code, { ...c, flag: flagFor(c.country) }]));
  }
  return citiesByCode;
}
