import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" es para la imagen Docker (docker-compose en jarvis).
  // Vercel usa su propio empaquetado serverless y no lo necesita — Vercel
  // define la variable de entorno VERCEL automáticamente en su build.
  output: process.env.VERCEL ? undefined : "standalone",
  // El monorepo raíz está dos niveles por encima de apps/web; asegura que
  // el trace incluya los packages del workspace (@vita/db, @vita/integrations).
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
