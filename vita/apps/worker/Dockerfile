# Build context: vita/ (raíz del monorepo). Ver docker-compose.yml.
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/agents/package.json packages/agents/package.json
COPY packages/integrations/package.json packages/integrations/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @vita/db build
RUN pnpm --filter @vita/worker build
RUN pnpm deploy --filter @vita/worker --prod /repo/deploy/worker

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/deploy/worker ./
CMD ["node", "dist/index.js"]
