# Despliegue en Vercel (además de Docker Compose)

> Decisión tomada por Enric: mientras *jarvis* no esté montado, `apps/web`
> se despliega en Vercel. La base de datos vive en **Timescale Cloud**
> (mantiene las hypertables). El worker (`apps/worker`, pg-boss) **no se
> despliega** todavía — Vercel no soporta procesos persistentes, y hoy
> solo hace el healthcheck de la Fase 0, nada que la app necesite para
> funcionar. `docker-compose.yml` sigue siendo válido para cuando
> *jarvis* esté listo (ver `docs/fase-0.md`); no es uno u otro.

No puedo crear la cuenta de Vercel ni la de Timescale Cloud yo mismo (no
tengo tus credenciales ni un token de API en este entorno) — estos pasos
los haces tú, y al final solo necesito dos cosas tuyas.

## 1. Timescale Cloud

1. Crea una cuenta en [console.cloud.timescale.com](https://console.cloud.timescale.com/)
   (tiene capa gratuita).
2. Crea un nuevo servicio Postgres (el asistente ya incluye la extensión
   TimescaleDB instalada).
3. Copia el **connection string** que te dan (algo como
   `postgres://tsdbadmin:<password>@<host>.tsdb.cloud.timescale.com:<puerto>/tsdb?sslmode=require`).
4. Pásamelo (aquí en el chat, como con Strava) para que aplique las
   migraciones una vez (`pnpm --filter @vita/db migrate`) — o hazlo tú
   mismo desde tu máquina si prefieres no compartirlo.

## 2. Proyecto en Vercel

1. En [vercel.com](https://vercel.com/), **Add New → Project**, conecta
   el repositorio `eom5a/Servicio-RESTful`.
2. **Root Directory**: `vita/apps/web` (Vercel detecta automáticamente
   el workspace pnpm hacia arriba, hasta `vita/pnpm-workspace.yaml`).
3. Framework preset: Next.js (autodetectado).
4. **Environment Variables** — añade todas las de `.env.example` con
   valores reales, como mínimo para arrancar:
   - `DATABASE_URL` (el connection string de Timescale Cloud)
   - `AUTH_USER_EMAIL`, `AUTH_PASSWORD_HASH`, `AUTH_SECRET`
   - `APP_ENCRYPTION_KEY`
   - `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN`
   - `ANTHROPIC_API_KEY` y las variables `AGENT_*_MODEL` (para cuando los
     agentes se conecten a jobs reales)
5. Deploy. Vercel te da un dominio del tipo `vita-xxxx.vercel.app` (o el
   que configures).

## 3. Después del primer despliegue

- **Redirect URI de Strava**: en
  [strava.com/settings/api](https://www.strava.com/settings/api), el
  campo "Authorization Callback Domain" debe ser el dominio de Vercel
  **sin protocolo ni ruta** (p. ej. `vita-xxxx.vercel.app`). El código ya
  construye la URL completa de callback dinámicamente a partir del host
  de la petición — no hay nada que cambiar en el repo.
- **Redirect URI de Google Health** (cuando llegue): añade
  `https://<tu-dominio-vercel>/api/integrations/google-health/callback`
  como Authorized redirect URI en Google Cloud Console, además del de
  `localhost` si lo habías puesto para pruebas.
- **Suscripción de webhook de Strava**: hay que crearla una vez contra
  la API de Strava con la URL pública de Vercel
  (`POST /api/v3/push_subscriptions`, ver `packages/integrations/src/strava.ts`
  → `createWebhookSubscription`). Se puede hacer con un script puntual
  una vez el dominio esté desplegado.

## Estado actual

- Proyecto Vercel `servicio-res-tful-owaz`, dominio de producción
  `servicio-res-tful-owaz.vercel.app`, rama de producción
  `claude/vita-health-agents-cuojkc`, Root Directory `vita/apps/web`.
- Timescale Cloud: migraciones aplicadas (17 tablas + 2 hypertables).

## Qué cambia respecto al plan original (`docs/fase-0.md`)

- Los datos de salud dejan de estar solo en la red local (Tailscale) y
  pasan a Vercel + Timescale Cloud, ambos de terceros. Es un cambio
  consciente de Enric, no una recomendación por defecto del proyecto.
- El worker no está desplegado en ningún sitio todavía. En cuanto haga
  falta (informes programados, agentes reactivos), hay que decidir dónde
  corre — Vercel Cron Jobs para tareas puntuales, o seguir con
  Docker Compose en *jarvis* para el proceso persistente de pg-boss.
