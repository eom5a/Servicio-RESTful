import { sql, eq, and } from "drizzle-orm";
import { db, integrations, workouts, encryptSecret, decryptSecret } from "@vita/db";
import {
  exchangeCodeForToken,
  refreshAccessToken,
  getActivities,
  type StravaTokenResponse,
  type StravaActivity,
} from "./strava.js";

const PROVIDER = "strava";

async function saveTokens(tokens: StravaTokenResponse): Promise<void> {
  await db
    .insert(integrations)
    .values({
      provider: PROVIDER,
      encryptedTokens: encryptSecret(JSON.stringify(tokens)),
      lastSync: new Date(),
      status: "conectado",
    })
    .onConflictDoUpdate({
      target: integrations.provider,
      set: {
        encryptedTokens: encryptSecret(JSON.stringify(tokens)),
        status: "conectado",
      },
    });
}

async function loadTokens(): Promise<StravaTokenResponse | null> {
  const [row] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.provider, PROVIDER))
    .limit(1);
  if (!row?.encryptedTokens) return null;
  return JSON.parse(decryptSecret(row.encryptedTokens)) as StravaTokenResponse;
}

/** Completa la conexión inicial tras el callback OAuth. */
export async function connectStrava(code: string): Promise<void> {
  const tokens = await exchangeCodeForToken(code);
  await saveTokens(tokens);
}

export async function getStravaStatus(): Promise<{
  connected: boolean;
  lastSync: Date | null;
}> {
  const [row] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.provider, PROVIDER))
    .limit(1);
  return {
    connected: row?.status === "conectado",
    lastSync: row?.lastSync ?? null,
  };
}

/** Devuelve un access token válido, refrescándolo primero si ha caducado. */
async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens();
  if (!tokens) {
    throw new Error("Strava no está conectado (falta pasar por /connect)");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (tokens.expires_at > nowSeconds + 60) {
    return tokens.access_token;
  }

  const refreshed = await refreshAccessToken(tokens.refresh_token);
  await saveTokens(refreshed);
  return refreshed.access_token;
}

function mapActivityToWorkout(activity: StravaActivity) {
  const kcal =
    activity.kilojoules !== undefined ? activity.kilojoules * 0.239006 : null;
  return {
    source: "strava",
    type: activity.type,
    startTs: new Date(activity.start_date),
    durationMin: String(activity.moving_time / 60),
    distanceKm: String(activity.distance / 1000),
    kcal: kcal !== null ? String(kcal) : null,
    avgHr: activity.average_heartrate
      ? Math.round(activity.average_heartrate)
      : null,
    maxHr: activity.max_heartrate ? Math.round(activity.max_heartrate) : null,
    rawData: { sourceId: String(activity.id), stravaActivity: activity },
  };
}

/**
 * Sincroniza las actividades de los últimos `days` días. Evita duplicar
 * si se llama varias veces (comprueba `raw_data->>'sourceId'`, ya que
 * `workouts` no tiene una columna dedicada para el id externo).
 */
export async function syncRecentActivities(
  days = 30,
): Promise<{ fetched: number; saved: number }> {
  const accessToken = await getValidAccessToken();
  const after = Math.floor(Date.now() / 1000) - days * 86400;

  let fetched = 0;
  let saved = 0;
  let page = 1;

  for (;;) {
    const activities = await getActivities(accessToken, { after, page, perPage: 50 });
    if (activities.length === 0) break;
    fetched += activities.length;

    for (const activity of activities) {
      const [existing] = await db
        .select({ id: workouts.id })
        .from(workouts)
        .where(
          and(
            eq(workouts.source, "strava"),
            sql`${workouts.rawData} ->> 'sourceId' = ${String(activity.id)}`,
          ),
        )
        .limit(1);
      if (existing) continue;

      await db.insert(workouts).values(mapActivityToWorkout(activity));
      saved += 1;
    }

    page += 1;
  }

  await db
    .update(integrations)
    .set({ lastSync: new Date() })
    .where(eq(integrations.provider, PROVIDER));

  return { fetched, saved };
}
