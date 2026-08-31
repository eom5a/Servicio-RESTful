# Nudge — habit tracker para TDAH/neurodivergentes

MVP en construcción según `docs/habit-tracker-strategy.md` (raíz del repo). Estado actual: **Fase 0** completada (setup + dirección de arte + rutas base). Fase 1 (auth + CRUD de hábitos reales) es el siguiente paso.

"Nudge" es un nombre de marcador de posición — cámbialo antes de lanzar si no te convence.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + componentes estilo shadcn/ui (escritos a mano, ver nota abajo) + Supabase (Postgres/Auth) + Stripe + Framer Motion (`motion`) + sonner.

> **Nota sobre shadcn/ui**: el dominio `ui.shadcn.com` está bloqueado en este entorno de desarrollo remoto, así que el CLI (`npx shadcn add ...`) no funciona aquí. Los componentes base (`src/components/ui/*`) están escritos a mano siguiendo el mismo patrón. En tu máquina local, si tienes acceso normal a internet, el CLI debería funcionar con normalidad (`components.json` ya está configurado) para añadir más componentes.

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # rellena las claves, ver siguiente sección
npm run dev
```

## Lo que falta conectar (requiere tus propias cuentas)

Esto es lo que no puedo hacer de forma autónoma porque necesita credenciales/pagos tuyos:

1. **Supabase**: crea un proyecto en [supabase.com](https://supabase.com) (tier gratuito). En *Project Settings → API* copia `URL` y `anon public key` a `.env.local`. Aplica el esquema ejecutando `supabase/migrations/0001_init.sql` desde el SQL Editor del dashboard (o con la CLI de Supabase si la instalas localmente: `supabase db push`).
2. **Stripe**: crea una cuenta, activa modo test, crea los productos/precios (mensual + lifetime) y copia las claves a `.env.local`. El checkout/webhook se implementa en la Fase 5.
3. **Vercel + dominio**: conecta este repo desde [vercel.com/new](https://vercel.com/new), apunta el *Root Directory* a `habit-tracker/`, añade las variables de `.env.local` en *Settings → Environment Variables*, y despliega. Cuando quieras un dominio propio, cómpralo (Namecheap, Porkbun, etc.) y añádelo en *Settings → Domains* del proyecto en Vercel — la configuración DNS te la da la propia Vercel paso a paso.

En cuanto tengas el proyecto de Supabase creado, dime la URL/anon key (o simplemente que ya está listo) y sigo con la Fase 1.

## Estructura

```
src/app/            rutas (App Router)
src/app/app/         zona autenticada (dashboard, hábitos, progreso, ajustes)
src/components/ui/    componentes base estilo shadcn
src/components/marketing/  componentes de la landing
src/lib/supabase/     clientes de Supabase (browser, server, admin)
src/proxy.ts          refresco de sesión (antes "middleware", renombrado en Next 16)
supabase/migrations/   esquema SQL versionado
```

## Verificación manual (Fase 0)

- `npm run lint` y `npm run build` pasan sin warnings.
- Todas las rutas devuelven 200 con el servidor de producción (`npm run start`) sin variables de Supabase configuradas — el proxy de sesión se degrada de forma segura en vez de romper el sitio.
