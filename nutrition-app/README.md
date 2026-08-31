# Nutrition Tracker

App personal de seguimiento nutricional y fitness: registra peso/composición corporal
(foto de la báscula Fitdays), comidas (foto → macros estimadas por IA), ejercicio
(informe de Google Health/Fit) y entrenamientos de gimnasio, con objetivos diarios
y un resumen tipo "coach" generado con Gemini.

Proyecto Next.js independiente dentro de este repositorio, sin relación con el
servicio Java legacy en `../service`.

## Requisitos

- Node.js 20.9+
- Una base de datos Postgres (en producción: [Neon](https://neon.com) vía la integración
  de Vercel Marketplace; en local puede ser cualquier Postgres, incluida la que levanta
  `docker compose`)
- Un store de [Vercel Blob](https://vercel.com/docs/vercel-blob) para las fotos subidas
  (las fotos ya no se guardan en disco local — el filesystem de Vercel es efímero)
- Una API key de [Google AI Studio](https://aistudio.google.com/apikey) para las
  funciones de análisis con IA (opcional: la app funciona sin ella, solo fallan
  los botones de "Analizar")

## Desarrollo local

```bash
npm install
cp .env.example .env   # rellena DATABASE_URL(_UNPOOLED), BLOB_READ_WRITE_TOKEN,
                        # GEMINI_API_KEY, APP_PASSCODE y APP_SESSION_SECRET
npx prisma db push     # crea las tablas en la base de datos apuntada por DATABASE_URL
npm run dev            # http://localhost:3000
```

La app pide un código de acceso (`APP_PASSCODE`) — es una app de un solo usuario,
no hay registro de cuentas. El usuario por defecto se crea solo la primera vez que
se necesita (`getDefaultUser()` en `src/lib/user.ts`), no hace falta seed manual.

## Variables de entorno

Ver `.env.example`. `APP_SESSION_SECRET` se puede generar con:

```bash
openssl rand -base64 32
```

## Coste de la API de Gemini

Se usa el modelo económico `gemini-2.5-flash` (configurable vía `GEMINI_MODEL`) y
las fotos se comprimen antes de enviarse. Con un uso diario normal (foto de báscula,
varias fotos de comida, un informe de ejercicio y un resumen diario) el coste
esperado es de pocos euros al mes.

## Despliegue en Vercel

La app está pensada para desplegarse en Vercel con **Neon** (Postgres) y **Vercel Blob**
(fotos) como integraciones de marketplace:

1. Importa el repo en Vercel con **Root Directory = `nutrition-app`**.
2. En la pestaña *Storage* del proyecto, conecta una base de datos **Neon** (Postgres) y
   un store de **Blob** — ambas inyectan sus variables de entorno automáticamente.
3. Añade manualmente `GEMINI_API_KEY`, `GEMINI_MODEL`, `APP_PASSCODE` y
   `APP_SESSION_SECRET`.
4. Despliega. El propio `build` (`prisma db push && next build`, ver `package.json`)
   crea las tablas en Neon la primera vez — no hace falta ejecutar nada a mano.

## Docker (self-host alternativo)

```bash
docker compose up --build
```

Levanta un Postgres local junto a la app (persistido en el volumen `nutrition_db`) y
aplica las migraciones automáticamente al arrancar. Aun así necesitas un
`BLOB_READ_WRITE_TOKEN` real en `.env` para las fotos — Blob es un servicio alojado,
no algo que este `docker-compose.yml` pueda levantar en local.

## Estructura

- `prisma/schema.prisma` — modelo de datos (peso, comidas, ejercicio, gimnasio, objetivos, notas del coach)
- `src/lib/gemini/` — integración con la API de Gemini (extracción estructurada vía JSON schema + validación con zod)
- `src/app/api/*/analyze/route.ts` — llaman a Gemini pero no escriben en la base de datos; el usuario revisa/edita antes de guardar
- `src/app/(app)/` — páginas autenticadas (dashboard, peso, comidas, ejercicio, gimnasio, objetivos)
- `src/proxy.ts` — gate de sesión (redirección optimista; la comprobación real vive en `src/lib/dal.ts`)
