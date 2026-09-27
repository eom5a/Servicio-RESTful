import { NextResponse } from "next/server";
import { syncRecentActivities } from "@vita/integrations";

export const dynamic = "force-dynamic";

/** Validación del webhook: Strava llama a esto una vez al crear la suscripción. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || token !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: "Verificación inválida" }, { status: 403 });
  }
  return NextResponse.json({ "hub.challenge": challenge });
}

/**
 * Evento de actividad nueva/actualizada. Por simplicidad (un solo
 * usuario, poco volumen) no se procesa el evento individual: se
 * resincronizan los últimos 7 días, con deduplicación ya incorporada en
 * `syncRecentActivities`.
 */
export async function POST(request: Request) {
  await request.json().catch(() => null); // consumir el body, no se usa
  try {
    await syncRecentActivities(7);
  } catch (error) {
    console.error("Error re-sincronizando Strava tras webhook:", error);
  }
  return NextResponse.json({ ok: true });
}
