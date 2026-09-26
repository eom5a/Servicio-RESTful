import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida (ver .env.example)");
}

async function main() {
  const migrationClient = postgres(connectionString!, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("Aplicando migraciones...");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migraciones aplicadas correctamente.");

  await migrationClient.end();
}

main().catch((err) => {
  console.error("Error aplicando migraciones:", err);
  process.exit(1);
});
