import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // El monorepo raíz está dos niveles por encima de apps/web; asegura que
  // el trace de standalone incluya los packages del workspace (@vita/db).
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
