# VITA — Centro personal de salud, nutrición y rendimiento

> Uso exclusivamente personal (un único usuario). Estado actual: **Fase 0 —
> infraestructura mínima**. Ver `docs/fase-0.md` para el detalle de qué
> incluye esta fase y qué queda para las siguientes.

## Estructura

```
vita/
├─ apps/
│  ├─ web/            # Next.js (UI + API routes)
│  └─ worker/         # pg-boss (colas/jobs; agentes en Fase 1)
├─ packages/
│  ├─ db/             # Esquema Drizzle + migraciones + cifrado de credenciales
│  ├─ agents/         # Vacío (Fase 1)
│  └─ integrations/   # Vacío (Fase 3)
├─ knowledge/         # Vacío (Fase 1)
├─ docs/              # Decisiones versionadas
└─ docker-compose.yml
```

## Requisitos

- Node.js ≥ 22, pnpm 10 (`corepack enable` lo resuelve solo)
- Docker + Docker Compose (para desplegar en el servidor)

## Puesta en marcha (desarrollo local, sin Docker)

```bash
cd vita
cp .env.example .env
# Rellenar en .env: AUTH_SECRET (openssl rand -hex 32),
# APP_ENCRYPTION_KEY (openssl rand -hex 32) y AUTH_PASSWORD_HASH
# (pnpm run hash-password "tu-contraseña")

pnpm install

# Levantar solo Postgres/Timescale con Docker y el resto en local:
docker compose up -d db

pnpm db:generate   # solo si has tocado packages/db/src/schema.ts
pnpm db:migrate    # aplica las migraciones

pnpm dev:web       # http://localhost:3000
pnpm dev:worker    # en otra terminal
```

## Despliegue en el servidor (jarvis) con Docker Compose

```bash
cd vita
cp .env.example .env   # y rellenar como arriba
docker compose up -d --build
docker compose exec worker node -e "console.log('ok')"  # smoke test rápido
```

Las migraciones no se aplican automáticamente al arrancar los contenedores
(a propósito, para no correr cambios de esquema sin control). Aplicarlas a
mano tras el primer `up`, desde el host, apuntando al puerto publicado por
el servicio `db`:

```bash
DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB \
  pnpm --filter @vita/db migrate
```

Acceso remoto (fuera de casa): exponer el puerto 3000 vía Tailscale, por
ejemplo con `tailscale serve --bg 3000`, en vez de publicar el puerto a
internet. Los puertos de `docker-compose.yml` están explícitamente
vinculados a `127.0.0.1` por este motivo.

## Comprobar que la infraestructura funciona

- `GET /api/health` (sin autenticar) → `{ ok: true, db: "up" }` si la web
  puede hablar con Postgres.
- El worker, al arrancar, encola y procesa un job de prueba
  (`infra-healthcheck`) y lo deja escrito en sus logs.
- `/login` pide la contraseña única (hash en `AUTH_PASSWORD_HASH`); tras
  entrar, `/hoy` muestra el estado de la base de datos.

## Backups

Pendiente de automatizar (`pg_dump` diario, sección 7 del documento de
arranque). No implementado en la Fase 0.
