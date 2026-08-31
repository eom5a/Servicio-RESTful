# Nutrition Tracker

App personal de seguimiento nutricional y fitness: registra peso/composición corporal
(foto de la báscula Fitdays), comidas (foto → macros estimadas por IA), ejercicio
(informe de Google Health/Fit) y entrenamientos de gimnasio, con objetivos diarios
y un resumen tipo "coach" generado con Gemini.

Proyecto Next.js independiente dentro de este repositorio, sin relación con el
servicio Java legacy en `../service`.

## Requisitos

- Node.js 20.9+
- Una API key de [Google AI Studio](https://aistudio.google.com/apikey) para las
  funciones de análisis con IA (opcional: la app funciona sin ella, solo fallan
  los botones de "Analizar")

## Desarrollo local

```bash
npm install
cp .env.example .env   # rellena GEMINI_API_KEY, APP_PASSCODE y APP_SESSION_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run dev            # http://localhost:3000
```

La app pide un código de acceso (`APP_PASSCODE`) — es una app de un solo usuario,
no hay registro de cuentas.

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

## Docker

```bash
docker compose up --build
```

Persiste la base de datos SQLite y las fotos subidas en un volumen (`nutrition_data`),
independiente de la imagen. Las migraciones se aplican automáticamente al arrancar
el contenedor.

## Estructura

- `prisma/schema.prisma` — modelo de datos (peso, comidas, ejercicio, gimnasio, objetivos, notas del coach)
- `src/lib/gemini/` — integración con la API de Gemini (extracción estructurada vía JSON schema + validación con zod)
- `src/app/api/*/analyze/route.ts` — llaman a Gemini pero no escriben en la base de datos; el usuario revisa/edita antes de guardar
- `src/app/(app)/` — páginas autenticadas (dashboard, peso, comidas, ejercicio, gimnasio, objetivos)
- `src/proxy.ts` — gate de sesión (redirección optimista; la comprobación real vive en `src/lib/dal.ts`)
