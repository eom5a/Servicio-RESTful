async function getJson(path, params) {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  }
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || `Error ${response.status}`);
  }
  return body;
}

export function getCalendar({ origin, destination, month, currency }) {
  return getJson('/api/calendar', { origin, destination, month, currency });
}

export function getCheapestDestinations({ origin, currency }) {
  return getJson('/api/cheapest-destinations', { origin, currency });
}

export function getSearchLink({ origin, destination, departDate, returnDate, adults }) {
  return getJson('/api/search-link', {
    origin,
    destination,
    depart_date: departDate,
    return_date: returnDate,
    adults,
  });
}
