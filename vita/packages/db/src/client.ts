import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Conexión perezosa: no lee DATABASE_URL ni abre el pool hasta la primera
// consulta real. Evita romper pasos que solo importan este módulo sin
// llegar a ejecutar nada (p. ej. la recolección de datos de página de
// Next.js en `next build`, que no tiene acceso a las variables de entorno
// de runtime).
let instance: Db | undefined;

function getDb(): Db {
  if (!instance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL no está definida (ver .env.example)");
    }
    const queryClient = postgres(connectionString);
    instance = drizzle(queryClient, { schema });
  }
  return instance;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
export type Database = Db;
