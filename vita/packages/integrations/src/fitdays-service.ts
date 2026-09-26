import { sql } from "drizzle-orm";
import { db, bodyMeasurements } from "@vita/db";
import { parseFitdaysExport, type FitdaysRow } from "./fitdays-import.js";

const SOURCE = "fitdays";

function toDbString(value: number | null): string | null {
  return value !== null ? String(value) : null;
}

function computeLeanMassKg(row: FitdaysRow): number | null {
  if (row.weightKg === null || row.fatPct === null) return null;
  return row.weightKg * (1 - row.fatPct / 100);
}

export type ImportFitdaysResult = {
  parsed: number;
  saved: number;
  warnings: string[];
};

/**
 * Parsea un export de Fitdays (CSV o XLS legacy, ver fitdays-import.ts) y
 * guarda cada pesaje en `body_measurements`. Usa upsert por (ts, source)
 * para poder re-subir el mismo export sin duplicar filas.
 */
export async function importFitdaysExport(
  buffer: Buffer,
): Promise<ImportFitdaysResult> {
  const { rows, warnings } = parseFitdaysExport(buffer);

  let saved = 0;
  for (const row of rows) {
    await db
      .insert(bodyMeasurements)
      .values({
        ts: row.ts,
        weightKg: toDbString(row.weightKg),
        fatPct: toDbString(row.fatPct),
        muscleMassKg: toDbString(row.muscleMassKg),
        leanMassKg: toDbString(computeLeanMassKg(row)),
        waterPct: toDbString(row.waterPct),
        visceralFat: toDbString(row.visceralFat),
        bmr: toDbString(row.bmr),
        source: SOURCE,
      })
      .onConflictDoUpdate({
        target: [bodyMeasurements.ts, bodyMeasurements.source],
        set: {
          weightKg: sql`excluded.weight_kg`,
          fatPct: sql`excluded.fat_pct`,
          muscleMassKg: sql`excluded.muscle_mass_kg`,
          leanMassKg: sql`excluded.lean_mass_kg`,
          waterPct: sql`excluded.water_pct`,
          visceralFat: sql`excluded.visceral_fat`,
          bmr: sql`excluded.bmr`,
        },
      });
    saved += 1;
  }

  return { parsed: rows.length, saved, warnings };
}
