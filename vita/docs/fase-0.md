# Fase 0 — Infraestructura mínima

Estado: **completa**, pendiente de validación por Enric antes de pasar a la
Fase 1 (agentes).

## Qué incluye

- Monorepo pnpm (`apps/web`, `apps/worker`, `packages/db`, `packages/agents`
  y `packages/integrations` como placeholders, `knowledge/`, `docs/`).
- `docker-compose.yml` con tres servicios: `db` (TimescaleDB sobre
  Postgres 16), `web` (Next.js) y `worker` (pg-boss). Puertos publicados
  solo en `127.0.0.1` — el acceso remoto se hace vía Tailscale
  (`tailscale serve`), nunca abriendo puertos a internet.
- Esquema de base de datos inicial (`packages/db/src/schema.ts`), fiel a la
  sección 5 del documento de arranque: `user_profile`, `phases`,
  `body_measurements`, `daily_activity`, `heart_rate`, `sleep_sessions`,
  `workouts`, `foods`, `meals`, `meal_items`, `supplements`, `lab_reports`,
  `lab_results`, `agent_insights`, `agent_decisions`, `reports`,
  `integrations`.
- Autenticación de un único usuario: contraseña + sesión larga (no
  passkey, ver "Decisiones" más abajo).
- Cifrado de credenciales de integraciones (`integrations.encrypted_tokens`)
  con AES-256-GCM, clave en `APP_ENCRYPTION_KEY` (fuera del repo).
- Variables de entorno documentadas en `.env.example`, incluyendo el
  modelo de Claude configurable por agente (Fase 1) y un límite de gasto
  mensual (`AGENT_MONTHLY_BUDGET_USD`) como control de coste inicial —
  el resumen de gasto en la web queda pendiente para cuando existan
  llamadas reales a la API.

## Decisiones y por qué

**Autenticación: contraseña + JWT en cookie, no passkey ni NextAuth/Auth.js.**
Con un único usuario, un provider de auth completo es sobreingeniería.
Se usa `jose` (compatible con el runtime Edge de Next.js, necesario para
verificar la sesión en `proxy.ts`, el antiguo `middleware.ts` en Next.js 16)
para firmar un JWT con el email del
usuario, guardado en una cookie `httpOnly` con expiración larga
(`AUTH_SESSION_DAYS`, por defecto 90 días). La contraseña se compara con
`bcryptjs` contra un hash guardado en `AUTH_PASSWORD_HASH`. Passkeys darían
mejor UX pero añaden una dependencia (WebAuthn, almacenamiento de
credenciales) que no aporta valor real para un usuario único en su propia
red; se puede revisar más adelante si molesta escribir la contraseña en
móvil.

**Cifrado de credenciales: AES-256-GCM manual, no una librería de secretos.**
Es una única función de cifrado/descifrado (`packages/db/src/crypto.ts`)
usada para los tokens OAuth de Strava/Fitbit/etc. antes de guardarlos en
`integrations.encrypted_tokens`. GCM da autenticación (detecta manipulación)
además de confidencialidad. La clave vive solo en `APP_ENCRYPTION_KEY`
(variable de entorno, nunca en el repo ni en la base de datos).

**TimescaleDB, hypertables solo en `body_measurements` y `heart_rate`.**
Son las dos series con volumen real de escritura (pesajes diarios, latidos
por segundo/minuto). El resto de tablas son de volumen bajo o de catálogo
y no necesitan particionado temporal. La conversión a hypertable se hace en
una migración SQL manual (`0002_timescale_hypertables.sql`) porque
Drizzle no genera `create_hypertable()` automáticamente.

**pnpm workspaces, no Turborepo/Nx.** Con 2 apps y 3 packages, un
orquestador de monorepo añade configuración sin beneficio claro todavía.
Si el build cross-package se vuelve lento (Fase 3+), se puede introducir
Turborepo sin tocar la estructura de carpetas.

**`packages/agents` y `packages/integrations` existen pero están vacíos.**
Se crean ya (con su `package.json` para que el workspace los resuelva) para
que la estructura de carpetas del documento de arranque quede fijada desde
el principio, pero su contenido real es explícitamente Fase 1 y Fase 3.

**Next.js en modo `standalone` para Docker.** Reduce el tamaño de la imagen
y evita copiar `node_modules` completo al contenedor final. Requiere
`outputFileTracingRoot` apuntando a la raíz del monorepo para que el
tracing incluya `@vita/db`.

**Worker: solo pg-boss + un job de prueba (`infra-healthcheck`).** El
objetivo de la Fase 0 es demostrar que worker, cola y base de datos están
conectados end-to-end, no implementar jobs reales — esos llegan con los
agentes en la Fase 1.

## Pendiente (fuera de alcance de la Fase 0, a propósito)

- Backups automáticos (`pg_dump` diario) — sección 7 del documento de
  arranque, no implementado todavía.
- Resumen de gasto de la API de Claude en la web — no hay llamadas reales
  todavía, solo el límite configurado en `.env.example`.
- PWA (manifest, service worker) y diseño de pantallas — Fase 4, decidido
  por los agentes a partir de `docs/metricas.md` y `docs/cruces.md`
  (Fase 2), que tampoco existen todavía.
- shadcn/ui: no instalado componente a componente; se añadirá bajo demanda
  en la Fase 4 (`npx shadcn add <componente>`) cuando exista el diseño real.

## Verificación realizada

- `pnpm install` en la raíz del monorepo, y `pnpm typecheck` / `pnpm build`
  sin errores en los 5 workspaces con código.
- `pnpm --filter @vita/db generate` genera las 17 tablas del esquema sin
  errores; una segunda ejecución confirma "no schema changes" (las
  migraciones en el repo están al día con `schema.ts`).
- Migraciones aplicadas contra un Postgres 16 real (`drizzle-orm`
  migrator): la migración `0000` (tablas, enums, FKs) se aplica limpia.
  La `0001` (hypertables) falla en local porque esta máquina no tiene la
  extensión `timescaledb` instalada — es el comportamiento esperado; en
  el servidor se aplica sobre la imagen `timescale/timescaledb`, que sí la
  trae.
- `next build` (modo `standalone`) completa sin errores ni warnings.
- **Smoke test end-to-end real**, con la web arrancada contra Postgres:
  `GET /api/health` → `{"ok":true,"db":"up"}`; acceso sin sesión a `/`
  redirige a `/login`; login con contraseña incorrecta → 401; login
  correcto → cookie de sesión firmada; `/hoy` con sesión válida renderiza
  y muestra "Base de datos: conectada"; logout borra la cookie y `/hoy`
  vuelve a redirigir a `/login`.
- El worker, empaquetado con `pnpm deploy --prod` (el mismo mecanismo que
  usa `apps/worker/Dockerfile`), arranca de forma standalone, crea la cola
  `infra-healthcheck`, encola y procesa el job de arranque contra Postgres
  real, y se cierra limpiamente con `SIGTERM`.
- `docker compose config` valida la sintaxis de `docker-compose.yml`
  (puertos en `127.0.0.1`, `depends_on` con healthcheck, variables
  resueltas correctamente).
- **No verificado in situ:** el `docker build`/`docker compose up`
  completo de las imágenes, porque este entorno de desarrollo no tiene un
  daemon de Docker en ejecución. La lógica de cada Dockerfile (instalación
  pnpm con workspaces, `next build` standalone, `pnpm deploy` para el
  worker) sí se ha probado por separado tal y como se describe arriba.
  Debe probarse el `docker compose up --build` completo en el servidor
  *jarvis* antes de dar la Fase 0 por buena del todo.
