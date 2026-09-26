import { eq, ilike } from "drizzle-orm";
import { db, foods } from "@vita/db";
import { getProductByBarcode, searchProductsByName } from "./openfoodfacts.js";

export type LocalFood = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number | null;
};

export type FoodCandidate =
  | ({ origin: "local" } & LocalFood)
  | {
      origin: "openfoodfacts";
      name: string;
      brand: string | null;
      barcode: string | null;
      kcal: number;
      proteinG: number;
      fatG: number;
      carbsG: number;
      fiberG: number | null;
    };

function toLocalFood(row: typeof foods.$inferSelect): LocalFood {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    barcode: row.barcode,
    kcal: Number(row.kcal),
    proteinG: Number(row.proteinG),
    fatG: Number(row.fatG),
    carbsG: Number(row.carbsG),
    fiberG: row.fiberG !== null ? Number(row.fiberG) : null,
  };
}

/**
 * Busca primero en la base propia (`foods`, alimentos ya usados
 * anteriormente) y complementa con Open Food Facts. Los resultados de
 * Open Food Facts sin macros completos (kcal/proteína/grasa/carbos) se
 * descartan: la tabla `foods` los exige como NOT NULL.
 */
export async function searchFoods(
  query: string,
  limit = 15,
): Promise<FoodCandidate[]> {
  const localRows = await db
    .select()
    .from(foods)
    .where(ilike(foods.name, `%${query}%`))
    .limit(limit);

  const local: FoodCandidate[] = localRows.map((row) => ({
    origin: "local",
    ...toLocalFood(row),
  }));

  const localBarcodes = new Set(local.map((f) => f.barcode).filter(Boolean));

  let remote: FoodCandidate[] = [];
  try {
    const offResults = await searchProductsByName(query, { limit });
    remote = offResults
      .filter(
        (p) =>
          p.kcalPer100g !== null &&
          p.proteinPer100g !== null &&
          p.fatPer100g !== null &&
          p.carbsPer100g !== null &&
          !(p.barcode && localBarcodes.has(p.barcode)),
      )
      .map((p) => ({
        origin: "openfoodfacts" as const,
        name: p.name,
        brand: p.brand,
        barcode: p.barcode,
        kcal: p.kcalPer100g!,
        proteinG: p.proteinPer100g!,
        fatG: p.fatPer100g!,
        carbsG: p.carbsPer100g!,
        fiberG: p.fiberPer100g,
      }));
  } catch (error) {
    // Open Food Facts puede fallar (red, límite de tasa); no debe tumbar
    // la búsqueda local.
    console.error("Fallo buscando en Open Food Facts:", error);
  }

  return [...local, ...remote].slice(0, limit);
}

export async function getFoodByBarcode(
  barcode: string,
): Promise<FoodCandidate | null> {
  const [localRow] = await db
    .select()
    .from(foods)
    .where(eq(foods.barcode, barcode))
    .limit(1);
  if (localRow) return { origin: "local", ...toLocalFood(localRow) };

  const product = await getProductByBarcode(barcode);
  if (
    !product ||
    product.kcalPer100g === null ||
    product.proteinPer100g === null ||
    product.fatPer100g === null ||
    product.carbsPer100g === null
  ) {
    return null;
  }

  return {
    origin: "openfoodfacts",
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    kcal: product.kcalPer100g,
    proteinG: product.proteinPer100g,
    fatG: product.fatPer100g,
    carbsG: product.carbsPer100g,
    fiberG: product.fiberPer100g,
  };
}

/**
 * Convierte un candidato en un alimento real de la tabla `foods` (con
 * id), guardándolo en la base propia si viene de Open Food Facts. Se
 * llama solo cuando el usuario elige de verdad un alimento para
 * registrarlo — no al buscar, para no llenar la tabla de resultados
 * nunca usados.
 */
export async function resolveFoodCandidate(
  candidate: FoodCandidate,
): Promise<LocalFood> {
  if (candidate.origin === "local") {
    const { origin, ...food } = candidate;
    return food;
  }

  if (candidate.barcode) {
    const [existing] = await db
      .select()
      .from(foods)
      .where(eq(foods.barcode, candidate.barcode))
      .limit(1);
    if (existing) return toLocalFood(existing);
  }

  const [inserted] = await db
    .insert(foods)
    .values({
      name: candidate.name,
      brand: candidate.brand,
      barcode: candidate.barcode,
      kcal: String(candidate.kcal),
      proteinG: String(candidate.proteinG),
      fatG: String(candidate.fatG),
      carbsG: String(candidate.carbsG),
      fiberG: candidate.fiberG !== null ? String(candidate.fiberG) : null,
      per100g: true,
      source: "openfoodfacts",
    })
    .returning();

  return toLocalFood(inserted);
}
