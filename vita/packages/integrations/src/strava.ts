/**
 * Cliente OAuth2 + API v3 de Strava. Documentación oficial:
 * https://developers.strava.com/docs/authentication/ y
 * https://developers.strava.com/docs/reference/. No verificado en vivo
 * en este entorno de desarrollo (el proxy de red del sandbox bloquea
 * www.strava.com) — confirmar el flujo completo de conexión en el
 * servidor real, donde sí hay salida a internet.
 */

const STRAVA_CLIENT_ID = () => requireEnv("STRAVA_CLIENT_ID");
const STRAVA_CLIENT_SECRET = () => requireEnv("STRAVA_CLIENT_SECRET");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no está definida (ver .env.example)`);
  return value;
}

export type StravaTokenResponse = {
  token_type: string;
  expires_at: number; // epoch seconds
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete?: { id: number; firstname: string; lastname: string };
};

export function buildAuthorizeUrl(redirectUri: string, state?: string): string {
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", STRAVA_CLIENT_ID());
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  // read: perfil básico. activity:read_all: incluye entrenamientos privados,
  // necesario porque VITA es de un único usuario y queremos todo su historial.
  url.searchParams.set("scope", "read,activity:read_all");
  if (state) url.searchParams.set("state", state);
  return url.toString();
}

async function postToken(body: Record<string, string>): Promise<StravaTokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID(),
      client_secret: STRAVA_CLIENT_SECRET(),
      ...body,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strava OAuth: error ${res.status} — ${text}`);
  }
  return res.json() as Promise<StravaTokenResponse>;
}

export function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  return postToken({ code, grant_type: "authorization_code" });
}

export function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  return postToken({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

export type StravaActivity = {
  id: number;
  name: string;
  type: string; // "Run", "Ride", "WeightTraining", ...
  start_date: string; // ISO
  elapsed_time: number; // segundos
  moving_time: number;
  distance: number; // metros
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
  kilojoules?: number;
  suffer_score?: number;
};

/** GET /athlete/activities, paginado. `after`/`before` en epoch segundos. */
export async function getActivities(
  accessToken: string,
  opts: { after?: number; before?: number; page?: number; perPage?: number } = {},
): Promise<StravaActivity[]> {
  const url = new URL("https://www.strava.com/api/v3/athlete/activities");
  if (opts.after) url.searchParams.set("after", String(opts.after));
  if (opts.before) url.searchParams.set("before", String(opts.before));
  url.searchParams.set("page", String(opts.page ?? 1));
  url.searchParams.set("per_page", String(opts.perPage ?? 30));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Strava: error ${res.status} al listar actividades`);
  }
  return res.json() as Promise<StravaActivity[]>;
}

/**
 * Crea la suscripción de webhooks (una única vez por app, no por usuario).
 * `callbackUrl` debe ser una URL pública HTTPS alcanzable por Strava —
 * no funciona contra localhost; en Tailscale, usar `tailscale serve`.
 */
export async function createWebhookSubscription(
  callbackUrl: string,
  verifyToken: string,
): Promise<{ id: number }> {
  const res = await fetch("https://www.strava.com/api/v3/push_subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID(),
      client_secret: STRAVA_CLIENT_SECRET(),
      callback_url: callbackUrl,
      verify_token: verifyToken,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strava: error ${res.status} creando la suscripción — ${text}`);
  }
  return res.json() as Promise<{ id: number }>;
}
