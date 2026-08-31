# Simple single-stage Docker build for self-hosting.
# Keeps the full node_modules (rather than the trimmed standalone trace) so
# `prisma migrate deploy` can run reliably at container start.
FROM node:22-alpine AS app

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Applies pending migrations, then starts the server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
